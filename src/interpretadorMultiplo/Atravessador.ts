import { INo } from './INo';

/**
 * Classe que permite caminhar pela árvore.
 *
 * @author Júlio César e Melo
 */
export default class Atravessador<TItem> {
    private no?: INo<TItem>;
    private $contador = 0;

    constructor(raiz: INo<TItem>, private construtor: boolean) {
        this.no = raiz;
    }

    /**
     * Caminha na árvore a partir da próxima letra.
     *
     * @param letra Letra por onde se deve caminhar.
     * @returns Nó referente à letra, novo nó (se construtor for verdadeiro)
     * ou undefined.
     */
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
