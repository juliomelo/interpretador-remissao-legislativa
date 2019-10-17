import { InterpretadorMultiplo } from './interpretadorMultiplo/InterpretadorMultiplo';
import partes from './partes';
import { TipoReferencia } from './TipoReferencia';

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
     * @param callback Método chamado ao encontrar uma referência.
     * @returns Índice da última posição verificada.
     */
    public interpretarReversamente(entrada: string,
                                   idx: number,
                                   callback: CallbackReferencia): number {
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
                    callback({
                        tipo: atravessador.noAtual.item!,
                        idx: idx + 1,
                        tamanho: atravessador.contador
                    });

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

        return idx;
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

/**
 * Localização da referência na entrada.
 *
 * @author Júlio César e Melo
 */
export interface IReferenciaEncontrada {
    tipo: TipoReferencia;
    idx: number;
    tamanho: number;
}

export type CallbackReferencia = (referencia: IReferenciaEncontrada) => void;
