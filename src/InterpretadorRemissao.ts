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
        normas = [
            {
                ambito: 'Federal',
                tipo: 'Constituição Federal',
                sigla: 'CF',
                semNumero: true
            },
            {
                ambito: 'Federal',
                tipo: 'Constituição da República Federativa do Brasil',
                sigla: 'CRFB',
                semNumero: true
            },
            {
                ambito: 'Estadual',
                tipo: 'Constituição do Estado',
                sigla: 'CE',
                semNumero: true
            },
            {
                ambito: 'Federal',
                tipo: 'Constituição Estadual',
                sigla: 'CE',
                semNumero: true
            },
            {
                ambito: 'Municipal',
                tipo: 'Lei Orgânica',
                sigla: 'LO',
                semNumero: true
            },
            ...normas];
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

    public interpretar(entrada: string): IInterpretacaoRemissao[] {
        const remissoes = this.interpretarRessissaoNormas(entrada);

        remissoes.forEach(remissao => this.interpretarRemissaoDispositivos(entrada, remissao));

        return remissoes;
    }

    private interpretarRessissaoNormas(entrada: string): IInterpretacaoRemissao[] {
        const resultado: IInterpretacaoRemissao[] = [];

        for (let m = this.regexp.exec(entrada); m; m = this.regexp.exec(entrada)) {
            const tipo = this.hashNormas.get(m[2].trim().toLowerCase())!;
            const idx = m.index + m[1].length;
            const texto = m[0].substr(m[1].length, m[0].length - m[1].length - m[5].length);

            if (m[3]) {
                resultado.push({
                    idx,
                    remissao: {
                        texto,
                        identificador: {
                            tipo,
                            numero: parseInt(m[3].replace(/\./g, ''), 10),
                            ano: parseInt(m[4], 10)
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

    private interpretarRemissaoDispositivos(entrada: string, remissao: IInterpretacaoRemissao): void {
        let idx = remissao.idx - 1;

        if (idx < 0) {
            return;
        }

        const referencia: IReferencia = {};
        let inicio = idx;

        for (const item of this.interpretadorDispositivo.interpretarReverso(entrada, idx)) {
            if (item.tipo in referencia) {
                console.debug(`Referência ${item.tipo} repetida em ${item.idx}.`);
                this.incorporarReferencia(remissao.remissao, referencia, entrada, inicio, idx - inicio + 1);
                idx = inicio - 1;
            }

            referencia[item.tipo] = item;
            inicio = Math.min(inicio, item.idx);
        }

        if (inicio !== idx) {
            this.incorporarReferencia(remissao.remissao, referencia, entrada, inicio, idx - inicio + 1);
        }
    }

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

    private extrairNumero(entrada: string,
                          referencia: IReferenciaEncontrada,
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
