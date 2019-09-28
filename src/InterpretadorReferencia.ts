import { InterpretadorMultiplo } from './interpretadorMultiplo/InterpretadorMultiplo';

export default class InterpretadorReferencia {
    private readonly interpretador = new InterpretadorMultiplo<TipoReferencia>();

    constructor() {
        const partes: {
            tipo: TipoReferencia,
            expressao: string[]
        }[] = [
                {
                    tipo: TipoReferencia.ARTIGO,
                    expressao: ['art', 'art.', 'artigo']
                },
                {
                    tipo: TipoReferencia.CAPUT,
                    expressao: ['caput']
                },
                {
                    tipo: TipoReferencia.PARAGRAFO,
                    expressao: ['parágrafo', 'paragrafo', '§', 'parág.', 'parag.']
                },
                {
                    tipo: TipoReferencia.INCISO,
                    expressao: ['inc', 'inc.', 'inciso']
                },
                {
                    tipo: TipoReferencia.ALINEA,
                    expressao: ['ali', 'ali.', 'alínea', 'alinea']
                },
                {
                    tipo: TipoReferencia.ITEM,
                    expressao: ['ite', 'item']
                },
                {
                    tipo: TipoReferencia.SUBSECAO,
                    expressao: ['subseção', 'subsecao', 'subsec', 'subsec.']
                },
                {
                    tipo: TipoReferencia.SECAO,
                    expressao: ['secao', 'sec.', 'sec']
                },
                {
                    tipo: TipoReferencia.CAPITULO,
                    expressao: ['capítulo', 'capitulo', 'cap.', 'cap']
                },
                {
                    tipo: TipoReferencia.TITULO,
                    expressao: ['título', 'titulo', 'tit.', 'tit']
                },
                {
                    tipo: TipoReferencia.PREAMBULO,
                    expressao: ['preambulo', 'preâmbulo', 'pré-âmbulo', 'pre-ambulo', 'préâmbulo', 'préambulo']
                }
            ];

        // Configura parser reverso (de trás para frente).
        partes.forEach(parte => {
            parte.expressao.forEach(expressao => this.interpretador.adicionar(this.inverter(expressao), parte.tipo));
        });
    }

    public *interpretarReverso(entrada: string, idx: number): IterableIterator<IReferenciaEncontrada> {
        const espaco = /\s/;
        const final = /[.:;!?()[\]{}'"\u2018\u2019\u201C\u201D]/;
        let atravessador = this.interpretador.criarAtravessador();
        let letra: string;
        let finalizado = false;

        do {
            letra = entrada.charAt(idx);

            if (espaco.test(letra)) {
                if (atravessador.noAtual && atravessador.noAtual.item) {
                    yield {
                        tipo: atravessador.noAtual.item!,
                        idx: idx + 1,
                        tamanho: atravessador.contador
                    };
                }

                atravessador = this.interpretador.criarAtravessador();
            } else {
                atravessador.caminhar(letra);
                finalizado = final.test(letra);
            }

            idx--;
        } while (idx >= 0 && !(finalizado && !atravessador.noAtual));
    }

    private inverter(termo: string) {
        let resultado = '';

        for (let i = termo.length - 1; i >= 0; i--) {
            resultado += termo.charAt(i);
        }

        return resultado;
    }
}

export enum TipoReferencia {
    ARTIGO = 'artigo',
    CAPUT = 'caput',
    INCISO = 'inciso',
    ALINEA = 'alinea',
    ITEM = 'item',
    PARAGRAFO = 'paragrafo',
    TITULO = 'titulo',
    CAPITULO = 'capitulo',
    SECAO = 'secao',
    SUBSECAO = 'subsecao',
    PREAMBULO = 'preambulo'
}

export interface IReferenciaEncontrada {
    tipo: TipoReferencia;
    idx: number;
    tamanho: number;
}
