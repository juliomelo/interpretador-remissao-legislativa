import { InterpretadorMultiplo } from './interpretadorMultiplo/InterpretadorMultiplo';

export default class InterpretadorReferencia {
    private readonly interpretador = new InterpretadorMultiplo<TipoReferencia>();

    constructor() {
        const partes: {
            tipo: TipoReferencia,
            expressao: string[],
            numerado: boolean
        }[] = [
                {
                    tipo: TipoReferencia.ARTIGO,
                    expressao: ['art', 'art.', 'artigo'],
                    numerado: true
                },
                {
                    tipo: TipoReferencia.CAPUT,
                    expressao: ['caput'],
                    numerado: false
                },
                {
                    tipo: TipoReferencia.INCISO,
                    expressao: ['inc', 'inc.', 'inciso'],
                    numerado: true
                },
                {
                    tipo: TipoReferencia.ALINEA,
                    expressao: ['ali', 'ali.', 'alínea', 'alinea'],
                    numerado: true
                },
                {
                    tipo: TipoReferencia.ITEM,
                    expressao: ['ite', 'item'],
                    numerado: true
                },
                {
                    tipo: TipoReferencia.SUBSECAO,
                    expressao: ['subseção', 'subsecao', 'subsec', 'subsec.'],
                    numerado: true
                },
                {
                    tipo: TipoReferencia.SECAO,
                    expressao: ['secao', 'sec.', 'sec'],
                    numerado: true
                },
                {
                    tipo: TipoReferencia.CAPITULO,
                    expressao: ['capítulo', 'capitulo', 'cap.', 'cap'],
                    numerado: true
                },
                {
                    tipo: TipoReferencia.TITULO,
                    expressao: ['título', 'titulo', 'tit.', 'tit'],
                    numerado: true
                },
                {
                    tipo: TipoReferencia.PREAMBULO,
                    expressao: ['preambulo', 'preâmbulo', 'pré-âmbulo', 'pre-ambulo', 'préâmbulo', 'préambulo'],
                    numerado: true
                }
            ];

        // Configura parser reverso (de trás para frente).
        partes.forEach(parte => {
            parte.expressao.forEach(expressao => this.interpretador.adicionar(this.inverter(expressao), parte.tipo));
        });
    }

    public *interpretarReverso(entrada: string, idx: number): IterableIterator<IReferenciaEncontrada> {
        const espaco = /\s/;
        const final = /[.:;!?()[\]]{}'"\u2018\u2019\u201C\u201D/;
        let atravessador = this.interpretador.criarAtravessador();
        let letra: string;

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
            }

            idx--;
        } while (idx >= 0 && !final.test(letra));
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