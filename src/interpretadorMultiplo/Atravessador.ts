import { INo } from './INo';

export default class Atravessador<TItem> {
    private no?: INo<TItem>;
    private $contador = 0;

    constructor(raiz: INo<TItem>, private construtor: boolean) {
        this.no = raiz;
    }

    public caminhar(letra: string): INo<TItem> | undefined {
        this.$contador++;

        if (!this.no) {
            return undefined;
        }

        let proximo = this.no.proximaLetra[letra];

        if (!proximo && this.construtor) {
            proximo = {
                proximaLetra: {}
            };

            this.no.proximaLetra[letra] = proximo;
        }

        this.no = proximo;

        return proximo;
    }

    public get noAtual(): INo<TItem> | undefined {
        return this.no;
    }

    public get contador() {
        return this.$contador;
    }
}
