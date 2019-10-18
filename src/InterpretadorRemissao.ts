import InterpretadorReferencia, { IReferenciaEncontrada, REGEXP_ESPACO, REGXP_FINAL as REGEXP_FINAL } from './InterpretadorReferencia';
// tslint:disable-next-line: max-line-length
import IRemissao, { IReferenciaAlinea, IReferenciaArtigo, IReferenciaInciso, IReferenciaItem, IReferenciaParagrafo } from './IRemissao';
import ITipoNorma from './ITipoNorma';
import { TipoReferencia, TiposReferencia } from './TipoReferencia';
import constituicao from './tiposNormas/constituicao';

/**
 * Resultado da interpretação da remissão.
 */
export type IInterpretacaoRemissaoExterna = IResultadoInterpretacao<IRemissao>;

export interface IResultadoInterpretacao<T> {
    /**
     * Índice da remissão no texto.
     */
    idx: number;

    /**
     * Remissão identificada.
     */
    remissao: T;
}

export interface IInterpretacaoRemissoes {
    internas: IResultadoInterpretacao<IReferenciaArtigo>[];
    externas: IInterpretacaoRemissaoExterna[];
}

/**
 * Opções para interpretação.
 */
export interface IInterpretadorRemissaoOpcoes {
    /**
     * Determina se a interpretação deve extrair apenas o segmento que
     * referencia o dispositivo (segmentarDispositivo: true) ou extrair
     * todo o texto até a remissão (padrão).
     */
    segmentarDispositivo?: boolean;
}

/**
 * Interpreta remissão a normas.
 *
 * @author Júlio César e Melo
 */
export default class InterpretadorRemissao {
    /**
     * Índice de normas organizados por tipo ou sigla.
     */
    private readonly hashNormas: Map<string, ITipoNorma>;

    /**
     * Expressão regular para encontrar normas.
     */
    private readonly regexp: RegExp;

    /**
     * Interpretador de referência de dispositivos.
     */
    private readonly interpretadorDispositivo = new InterpretadorReferencia();

    /**
     * Constrói o interpretador de remissão.
     *
     * @param normas Tipos de normas conhecidos.
     * @param opcoes Opções de interpretação.
     */
    constructor(normas: ITipoNorma[], private opcoes: IInterpretadorRemissaoOpcoes = {}) {
        normas = [...constituicao, ...normas];
        this.hashNormas = new Map();

        for (const norma of normas) {
            this.hashNormas.set(norma.tipo.trim().toLocaleLowerCase(), norma);
            this.hashNormas.set(norma.sigla.trim().toLocaleLowerCase(), norma);
        }

        const regexpInicio = '(^|\\s|[.:;,!?()[\\]{}`´"\'\u2018\u2019\u201C\u201D])';
        const regexpNormas = '(' +
            normas.map(norma => norma.tipo.trim().replace(/\s+/g, '\\s+'))
                .concat(normas.map(norma => norma.sigla.trim()))
                .sort((a, b) => b.length - a.length)
                .join('|') + ')';
        const regexpNumero = '(?:(?:n[º.]?|n[uú]mero|n[uú]m\\.)\\s*)?(\\d+(?:\\.\\d{3})+)';
        const regexpDiaMes = '\\s*de\\s*\\d+\\s*de(?:\\s*\\d+\\s*|\\s+\\S+\\s+)de\\s*';
        const regexpAno = `(?:(?:[/-:]|,?${regexpDiaMes}|,?\\s*?de\\s*?|\\s+)(\\d+)(?!\\s*de\\s*\\S+\\s*de\\s*\\d+))`;
        const regexpFinal = '($|\\s|[.:;,!?()[\\]{}`´"\'\u2018\u2019\u201C\u201D])';

        // tslint:disable-next-line: max-line-length
        this.regexp = new RegExp(`${regexpInicio}${regexpNormas}(?:\\s*${regexpNumero}${regexpAno}?)?${regexpFinal}`, 'ig');
    }

    /**
     * Interpreta um texto, a fim de extrair as remissões com a referência
     * precisa a dispositivos.
     *
     * @param entrada Texto em que se buscarão as remissões.
     * @returns Remissões.
     */
    public interpretar(entrada: string): IInterpretacaoRemissoes {
        const remissoes = this.interpretarRessissaoNormas(entrada);
        const idxRefs = remissoes.map(remissao => this.interpretarRemissaoDispositivosDeNormas(entrada, remissao))
            .filter(idxRef => idxRef !== null) as ITrecho[];
        const remissoesInternas = this.interpretarRemissoesInternas(entrada, idxRefs);

        return {
            externas: remissoes,
            internas: remissoesInternas
        };
    }

    /**
     * Interpreta um texto, a fim de extrair as remissões para normas, porém
     * desconsiderando qualquer referência a dispositivo. Este é o primeiro
     * passo para a identificação da remissão.
     *
     * @param entrada Texto em que se buscarão as remissões.
     */
    private interpretarRessissaoNormas(entrada: string): IInterpretacaoRemissaoExterna[] {
        const resultado: IInterpretacaoRemissaoExterna[] = [];

        for (let m = this.regexp.exec(entrada); m; m = this.regexp.exec(entrada)) {
            const [casamento, mInicio, mTipoNorma, mNumero, mAno, mFinal] = m;
            const tipo = this.hashNormas.get(mTipoNorma.trim().toLowerCase())!;
            const idx = m.index + mInicio.length;
            const texto = casamento.substr(mInicio.length, casamento.length - mInicio.length - mFinal.length);

            if (mNumero) {
                resultado.push({
                    idx,
                    remissao: {
                        texto,
                        identificador: {
                            tipo,
                            numero: parseInt(mNumero.replace(/\./g, ''), 10),
                            ano: parseInt(mAno, 10)
                        },
                        referencias: []
                    }
                });
            } else if (tipo.semNumero) {
                resultado.push({
                    idx,
                    remissao: {
                        texto,
                        identificador: {
                            tipo
                        },
                        referencias: []
                    }
                });
            }
        }

        return resultado;
    }

    /**
     * Interpreta referência a dispositivos para uma determinada remissão
     * para norma. Este método completa as informações da remissão para
     * norma interpretada anteriormente.
     *
     * @param entrada Texto em que serão buscadas as remissões.
     * @param remissao Remissão cuja referência será interpretada.
     */
    private interpretarRemissaoDispositivosDeNormas(entrada: string,
                                                    remissao: IInterpretacaoRemissaoExterna): ITrecho | null {
        let idx = remissao.idx - 1;

        if (idx < 0) {
            return null;
        }

        let referencia: IHashReferencia = {};
        let inicio = idx;
        let final = -1;

        this.interpretadorDispositivo.interpretarReversamente(entrada, idx, item => {
            if (item.tipo in referencia) {
                console.debug(`Referência ${item.tipo} repetida em ${item.idx}.`);

                const tamanho = (this.opcoes.segmentarDispositivo
                    ? this.encontrarFinalTrecho(entrada, final)
                    : idx) - inicio + 1;

                remissao.remissao.referencias.unshift(
                    this.criarReferencia(referencia, entrada, inicio, tamanho)
                );

                // Reinicia o contexto.
                idx = inicio - 1;
                final = -1;
                referencia = {};
            }

            referencia[item.tipo] = item;
            inicio = Math.min(inicio, item.idx);
            final = Math.max(final, item.idx + item.tamanho);
        });

        if (inicio !== idx) {
            const tamanho = (this.opcoes.segmentarDispositivo
                    ? this.encontrarFinalTrecho(entrada, final)
                    : idx) - inicio + 1;

            remissao.remissao.referencias.unshift(
                this.criarReferencia(referencia, entrada, inicio, tamanho)
            );
        }

        return {inicio, final: remissao.idx + remissao.remissao.texto.length};
    }

    private encontrarFinalTrecho(entrada: string, idx: number): number {
        if (!REGEXP_FINAL.test(entrada.charAt(idx))) {
            idx++;
        }

        let letra = entrada.charAt(idx);

        while (!REGEXP_FINAL.test(letra) && !REGEXP_ESPACO.test(letra)) {
            letra = entrada.charAt(++idx);
        }

        return idx - 1;
    }

    /**
     * Cria a referência para um dispositivo interpretado.
     * 
     * @param referencia Referência a incorporar na remissão.
     * @param entrada Texto em que foi feita a interpretação.
     * @param inicio Índice inicial do texto em que a referência foi encontrada.
     * @param tamanho Tamanho da referência encontrada.
     * @param segmentar Determina se a interpretação deve extrair apenas o segmento que
     * referencia o dispositivo ou extrair todo o texto até a remissão.
     */
    private criarReferencia(referencia: IHashReferencia,
                            entrada: string,
                            inicio: number,
                            tamanho: number):
                IReferenciaArtigo | IReferenciaParagrafo | IReferenciaInciso | IReferenciaAlinea | IReferenciaItem {
        const texto = entrada.substr(inicio, tamanho);

        return {
            artigo: this.extrairNumero(texto, inicio, referencia[TipoReferencia.ARTIGO]),
            paragrafo: this.extrairNumero(texto, inicio, referencia[TipoReferencia.PARAGRAFO], false),
            // tslint:disable-next-line: max-line-length
            inciso: this.extrairNumero(texto, inicio, referencia[TipoReferencia.INCISO], TipoReferencia.ALINEA in referencia),
            // tslint:disable-next-line: max-line-length
            alinea: this.extrairNumero(texto, inicio, referencia[TipoReferencia.ALINEA], TipoReferencia.ITEM in referencia),
            item: this.extrairNumero(texto, inicio, referencia[TipoReferencia.ITEM], false),
            texto
        } as IReferenciaItem;
    }

    private interpretarRemissoesInternas(entrada: string,
                                         trechosAIgnorar: ITrecho[]): IResultadoInterpretacao<IReferenciaArtigo>[] {
        trechosAIgnorar.sort((a, b) => a.inicio - b.inicio);

        let idx = entrada.length - 1;
        let ignorar = trechosAIgnorar.pop();

        const deveIgnorar = (i: number) => {
            while (ignorar && i < ignorar.inicio) {
                ignorar = trechosAIgnorar.pop();
            }

            return ignorar && i >= ignorar.inicio && i <= ignorar.final;
        };

        const resultado: IResultadoInterpretacao<IReferenciaArtigo>[] = [];

        while (idx >= 0) {
            let referencia: IHashReferencia = {};
            let inicio = idx;
            let final = -1;

            const novoIdx = this.interpretadorDispositivo.interpretarReversamente(entrada, idx, item => {
                if (!deveIgnorar(item.idx)) {
                    if (item.tipo in referencia) {
                        console.debug(`Referência ${item.tipo} repetida em ${item.idx}.`);

                        const tamanho = this.encontrarFinalTrecho(entrada, final) - inicio + 1;

                        resultado.unshift({
                            idx: inicio,
                            remissao: this.criarReferencia(referencia, entrada, inicio, tamanho)
                        });

                        // Reinicia o contexto.
                        idx = inicio - 1;
                        final = -1;
                        referencia = {};
                    }

                    referencia[item.tipo] = item;
                    inicio = Math.min(inicio, item.idx);
                    final = Math.max(final, item.idx + item.tamanho);
                }
            });

            if (inicio !== idx) {
                const tamanho = this.encontrarFinalTrecho(entrada, final) - inicio + 1;

                resultado.unshift({
                    idx: inicio,
                    remissao: this.criarReferencia(referencia, entrada, inicio, tamanho)
                });
            }

            idx = novoIdx;
        }

        return resultado;
    }

    /**
     * Extrai o número do dispositivo referenciado.
     *
     * @param trecho Texto em que a referência foi interpretada.
     * @param inicio Índice da posição de trecho na entrada.
     * @param referencia Referência encontrada.
     * @param obrigatorio Determina se a referência deve obrigatoriamente possuir um número.
     * @returns Número do dispositivo.
     */
    private extrairNumero(trecho: string,
                          inicio: number,
                          referencia: IReferenciaEncontrada | undefined,
                          obrigatorio: boolean = true): string | undefined {
        if (!referencia) {
            if (obrigatorio) {
                throw new Error(`Referência incompleta.`);
            }

            return undefined;
        }

        const espaco = /\s|,/;
        let idx = referencia.idx - inicio + referencia.tamanho;

        while (idx < trecho.length && espaco.test(trecho.charAt(idx))) {
            idx++;
        }

        let ultimoIdx = idx + 1;

        while (ultimoIdx < trecho.length && !espaco.test(trecho.charAt(ultimoIdx))) {
            ultimoIdx++;
        }

        if (ultimoIdx === idx) {
            if (obrigatorio) {
                throw new Error(`Referência incompleta.`);
            }

            return undefined;
        } else {
            return trecho.substr(idx, ultimoIdx - idx).replace(/[\u2018\u2019\u201C\u201D'"]/g, '');
        }
    }
}

/**
 * Índice de referências de dispositivos organizados por tipo de dispositivo.
 */
type IHashReferencia = { [tipo in TiposReferencia]?: IReferenciaEncontrada };

interface ITrecho {
    inicio: number;
    final: number;
}
