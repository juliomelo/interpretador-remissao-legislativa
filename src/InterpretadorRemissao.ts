import IRemissao from './IRemissao';
import ITipoNorma from './ITipoNorma';

export interface IInterpretacaoRemissao {
    idx: number;
    remissao: IRemissao;
}

export default class InterpretadorRemissao {
    private hashNormas: Map<string, ITipoNorma>;
    private regexp: RegExp;

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
}
