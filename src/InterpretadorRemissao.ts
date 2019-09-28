import InterpretadorReferencia, { IReferenciaEncontrada, TipoReferencia } from './InterpretadorReferencia';
import IRemissao, { IReferenciaItem } from './IRemissao';
import ITipoNorma from './ITipoNorma';

export interface IInterpretacaoRemissao {
    idx: number;
    remissao: IRemissao;
}

export interface IReferencia {
    [tipo: string]: IReferenciaEncontrada;
}

export default class InterpretadorRemissao {
    private hashNormas: Map<string, ITipoNorma>;
    private regexp: RegExp;
    private interpretadorDispositivo = new InterpretadorReferencia();

    constructor(normas: ITipoNorma[]) {
        this.hashNormas = new Map();

        for (const norma of normas) {
            this.hashNormas.set(norma.tipo.trim().toLocaleLowerCase(), norma);
            this.hashNormas.set(norma.sigla.trim().toLocaleLowerCase(), norma);
        }

        const regexpNumero = '(?:(?:n[º.]?|n[uú]mero|n[uú]m\\.)\\s*)?(\\d+(?:\\.\\d{3})+)';
        const regexpDiaMes = '\\s*de\\s*\\d+\\s*de(?:\\s*\\d+\\s*|\\s+\\S+\\s+)de\\s*';
        const regexpAno = `(?:(?:\\s*?de\\s*?|[/-:]|,?${regexpDiaMes}|\\s+)(\\d+))`;

        this.regexp = new RegExp(`(${
            normas.map(norma => norma.tipo.trim())
                .concat(normas.map(norma => norma.sigla.trim())).join('|')
            })\\s*${regexpNumero}${regexpAno}?`, 'ig');
    }

    public interpretar(entrada: string): IInterpretacaoRemissao[] {
        const remissoes = this.interpretarRessissaoNormas(entrada);

        remissoes.forEach(remissao => this.interpretarRemissaoDispositivos(entrada, remissao));

        return remissoes;
    }

    private interpretarRessissaoNormas(entrada: string): IInterpretacaoRemissao[] {
        const resultado: IInterpretacaoRemissao[] = [];

        for (let m = this.regexp.exec(entrada); m; m = this.regexp.exec(entrada)) {
            resultado.push({
                idx: m.index,
                remissao: {
                    texto: m[0],
                    identificador: {
                        tipo: this.hashNormas.get(m[1].trim().toLowerCase())!,
                        numero: parseInt(m[2].replace(/\./g, ''), 10),
                        ano: parseInt(m[3], 10)
                    }
                }
            });
        }

        return resultado;
    }

    private interpretarRemissaoDispositivos(entrada: string, remissao: IInterpretacaoRemissao): void {
        const idx = remissao.idx;
        const referencia: IReferencia = {};
        let inicio = idx;

        for (const item of this.interpretadorDispositivo.interpretarReverso(entrada, idx)) {
            if (item.tipo in referencia) {
                throw new Error(`Referência repetida: ${item.tipo}.`);
            }

            referencia[item.tipo] = item;
            inicio = Math.min(inicio, item.idx);
        }

        if (inicio !== idx) {
            remissao.remissao.referencia = {
                artigo: this.extrairNumero(entrada, referencia[TipoReferencia.ARTIGO]),
                paragrafo: this.extrairNumero(entrada, referencia[TipoReferencia.PARAGRAFO], false),
                // tslint:disable-next-line: max-line-length
                inciso: this.extrairNumero(entrada, referencia[TipoReferencia.INCISO], TipoReferencia.ALINEA in referencia),
                // tslint:disable-next-line: max-line-length
                alinea: this.extrairNumero(entrada, referencia[TipoReferencia.ALINEA], TipoReferencia.ITEM in referencia),
                item: this.extrairNumero(entrada, referencia[TipoReferencia.ITEM], false),
                texto: entrada.substr(inicio, idx - inicio)
            } as IReferenciaItem;
        }
    }

    private extrairNumero(entrada: string,
                          referencia: IReferenciaEncontrada,
                          obrigatorio: boolean = true): string | undefined {
        if (!referencia) {
            if (obrigatorio) {
                throw new Error(`Referência incompleta.`);
            }

            return undefined;
        }

        const espaco = /\s/;
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
            return entrada.substr(idx, ultimoIdx - idx);
        }
    }
}
