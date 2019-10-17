import InterpretadorReferencia, { IReferenciaEncontrada } from './InterpretadorReferencia';
import IRemissao, { IReferenciaItem } from './IRemissao';
import ITipoNorma from './ITipoNorma';
import { TipoReferencia, TiposReferencia } from './TipoReferencia';
import constituicao from './tiposNormas/constituicao';

/**
 * Resultado da interpretação da remissão.
 */
export interface IInterpretacaoRemissao {
    /**
     * Índice da remissão no texto.
     */
    idx: number;

    /**
     * Remissão identificada.
     */
    remissao: IRemissao;
}

/**
 * Índice de referências de dispositivos organizados por tipo de dispositivo.
 */
export type IReferencia = { [tipo in TiposReferencia]?: IReferenciaEncontrada };

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
    public interpretar(entrada: string): IInterpretacaoRemissao[] {
        const remissoes = this.interpretarRessissaoNormas(entrada);

        remissoes.forEach(remissao => this.interpretarRemissaoDispositivosDeNormas(entrada, remissao));

        return remissoes;
    }

    /**
     * Interpreta um texto, a fim de extrair as remissões para normas, porém
     * desconsiderando qualquer referência a dispositivo. Este é o primeiro
     * passo para a identificação da remissão.
     *
     * @param entrada Texto em que se buscarão as remissões.
     */
    private interpretarRessissaoNormas(entrada: string): IInterpretacaoRemissao[] {
        const resultado: IInterpretacaoRemissao[] = [];

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
                        }
                    }
                });
            } else if (tipo.semNumero) {
                resultado.push({
                    idx,
                    remissao: {
                        texto,
                        identificador: {
                            tipo
                        }
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
    private interpretarRemissaoDispositivosDeNormas(entrada: string, remissao: IInterpretacaoRemissao): void {
        let idx = remissao.idx - 1;

        if (idx < 0) {
            return;
        }

        const referencia: IReferencia = {};
        let inicio = idx;
        let final = -1;

        for (const item of this.interpretadorDispositivo.interpretarReverso(entrada, idx)) {
            if (item.tipo in referencia) {
                console.debug(`Referência ${item.tipo} repetida em ${item.idx}.`);
                const tamanho = this.opcoes.segmentarDispositivo
                    ? entrada.indexOf(' ', final + 1) - inicio
                    : idx - inicio + 1;
                this.incorporarReferencia(remissao.remissao, referencia, entrada, inicio, tamanho);
                idx = inicio - 1;
                final = -1;
            }

            referencia[item.tipo] = item;
            inicio = Math.min(inicio, item.idx);
            final = Math.max(final, item.idx + item.tamanho);
        }

        if (inicio !== idx) {
            const tamanho = this.opcoes.segmentarDispositivo
                ? entrada.indexOf(' ', final + 1) - inicio
                : idx - inicio + 1;
            this.incorporarReferencia(remissao.remissao, referencia, entrada, inicio, tamanho);
        }
    }

    /**
     *
     * @param remissao Remissão cuja referência será incorporada.
     * @param referencia Referência a incorporar na remissão.
     * @param entrada Texto em que foi feita a interpretação.
     * @param inicio Índice inicial do texto em que a referência foi encontrada.
     * @param tamanho Tamanho da referência encontrada.
     */
    private incorporarReferencia(remissao: IRemissao,
                                 referencia: IReferencia,
                                 entrada: string,
                                 inicio: number,
                                 tamanho: number) {
        if (!remissao.referencia) {
            remissao.referencia = [];
        }

        remissao.referencia.unshift({
            artigo: this.extrairNumero(entrada, referencia[TipoReferencia.ARTIGO]),
            paragrafo: this.extrairNumero(entrada, referencia[TipoReferencia.PARAGRAFO], false),
            // tslint:disable-next-line: max-line-length
            inciso: this.extrairNumero(entrada, referencia[TipoReferencia.INCISO], TipoReferencia.ALINEA in referencia),
            // tslint:disable-next-line: max-line-length
            alinea: this.extrairNumero(entrada, referencia[TipoReferencia.ALINEA], TipoReferencia.ITEM in referencia),
            item: this.extrairNumero(entrada, referencia[TipoReferencia.ITEM], false),
            texto: entrada.substr(inicio, tamanho)
        } as IReferenciaItem);
    }

    /**
     * Extrai o número do dispositivo referenciado.
     *
     * @param entrada Texto em que a referência foi interpretada.
     * @param referencia Referência encontrada.
     * @param obrigatorio Determina se a referência deve obrigatoriamente possuir um número.
     * @returns Número do dispositivo.
     */
    private extrairNumero(entrada: string,
                          referencia: IReferenciaEncontrada | undefined,
                          obrigatorio: boolean = true): string | undefined {
        if (!referencia) {
            if (obrigatorio) {
                throw new Error(`Referência incompleta.`);
            }

            return undefined;
        }

        const espaco = /\s|,/;
        let idx = referencia.idx + referencia.tamanho;

        while (idx < entrada.length && espaco.test(entrada.charAt(idx))) {
            idx++;
        }

        let ultimoIdx = idx + 1;

        while (ultimoIdx < entrada.length && !espaco.test(entrada.charAt(ultimoIdx))) {
            ultimoIdx++;
        }

        if (ultimoIdx >= entrada.length) {
            if (obrigatorio) {
                throw new Error(`Referência incompleta.`);
            }

            return undefined;
        } else {
            return entrada.substr(idx, ultimoIdx - idx).replace(/[\u2018\u2019\u201C\u201D'"]/g, '');
        }
    }
}
