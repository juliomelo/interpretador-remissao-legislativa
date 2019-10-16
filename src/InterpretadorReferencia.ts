import { InterpretadorMultiplo } from './interpretadorMultiplo/InterpretadorMultiplo';

/**
 * Interpreta referência de dispositivo.
 *
 * @author Júlio César e Melo
 */
export default class InterpretadorReferencia {
    private readonly interpretador = new InterpretadorMultiplo<TipoReferencia>();

    /**
     * Determina o limite de termos desconhecidos antes de interromper a
     * interpretação de referência. Pode ser entendido também como a distância
     * máxima (em número de termos), em que a referência ao dispositivo se
     * encontra, da citação à norma.
     */
    private readonly limiteDesencontros = 4;

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

    /**
     * Realiza interpretação reversa (de trás para frente) do texto,
     * em busca de referência de dispositivos.
     *
     * A interpretação reversa permite um melhor desempenho em idenficiação de
     * referências a partir da identificação de uma remissão de norma no mesmo texto.
     * Para tanto, basta fornecer como índice (parâmetro idx) a posição exata
     * da remissão para a norma no texto.
     *
     * @param entrada Texto de cuja referência será extraída.
     * @param idx Índice do texto de onde a interpretação iniciará.
     */
    public *interpretarReverso(entrada: string, idx: number): IterableIterator<IReferenciaEncontrada> {
        const espaco = /\s|,/;
        const final = /[.:;!?()[\]{}]/;
        let atravessador = this.interpretador.criarAtravessador();
        let letra: string;
        let finalizado = false;
        let desencontros = 0;

        while (idx >= 0 && espaco.test(entrada.charAt(idx))) {
            idx--;
        }

        do {
            letra = entrada.charAt(idx);

            if (espaco.test(letra) || final.test(letra)) {
                // Se temos um nó atual, então é um casamento!
                if (atravessador.noAtual && atravessador.noAtual.item) {
                    yield {
                        tipo: atravessador.noAtual.item!,
                        idx: idx + 1,
                        tamanho: atravessador.contador
                    };

                    finalizado = false;
                    desencontros = 0;
                    atravessador = this.interpretador.criarAtravessador();
                } else if (!!atravessador.caminhar(letra)) {
                    // É um finalizador!
                    finalizado = true;
                    idx--;
                } else {
                    desencontros++;
                    atravessador = this.interpretador.criarAtravessador();

                    do {
                        finalizado = finalizado || final.test(entrada.charAt(idx));
                        idx--;
                    } while (idx >= 0 && espaco.test(entrada.charAt(idx)));
                }
            } else {
                atravessador.caminhar(letra);
                idx--;
            }
        } while (idx >= 0 && !(finalizado && !atravessador.noAtual) && this.limiteDesencontros >= desencontros);
    }

    /**
     * Inverte um literal.
     *
     * @param termo Literal a ser invertido.
     */
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

/**
 * Resultado da interpretação de referência.
 *
 * @author Júlio César e Melo
 */
export interface IReferenciaEncontrada {
    tipo: TipoReferencia;
    idx: number;
    tamanho: number;
}
