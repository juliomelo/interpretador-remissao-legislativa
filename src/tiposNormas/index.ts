import ITipoNorma from './ITipoNorma';
import minasGerais from './minasGerais';

export function obterNormasPorLocal(local: string) {
    switch (local.toLowerCase().trim()) {
        case 'palácio da inconfidência':
        case 'belo horizonte':
            return minasGerais;

        default:
            if (/minas gerais|belo horizonte|ouro preto|juiz de fora/i.test(local)) {
                return minasGerais;
            }
            break;
    }

    return [];
}

export default minasGerais; // A idéia é colocar [...minasGerais, ...saoPaulo, ...rioDeJaneiro, ...]
export { ITipoNorma };
