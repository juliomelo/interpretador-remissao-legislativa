import Atravessador from './Atravessador';
import { INo } from './INo';

export class InterpretadorMultiplo<TItem> {
    private readonly raiz: INo<TItem>;

    constructor() {
        this.raiz = {
            proximaLetra: {}
        };
    }

    public adicionar(termo: string, item: TItem): void {
        const atravessador = new Atravessador<TItem>(this.raiz, true);

        for (let i = 0; i < termo.length; i++) {
            atravessador.caminhar(termo.charAt(i));
        }

        if (atravessador.noAtual!.item) {
            throw new Error(`Termo ${termo} já possuía item definido.`);
        }

        atravessador.noAtual!.item = item;
    }

    public criarAtravessador() {
        return new Atravessador<TItem>(this.raiz, false);
    }
}

export interface ISequencia<T> {
    [letra: string]: INo<T>;
}
