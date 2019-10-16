import { readFileSync } from 'fs';
import InterpretadorRemissao from '../src/InterpretadorRemissao';
import minasGerais from '../src/tiposNormas/minasGerais';

describe('InterpretadorRemissao', () => {
    const normas = [...minasGerais, {
        ambito: 'Federal',
        tipo: 'Lei Federal',
        sigla: 'LF'
    }];
    const interpretador = new InterpretadorRemissao(normas);
    const interpretadorSegmentado = new InterpretadorRemissao(normas, { segmentarDispositivo: true });

    function testar(entrada: string) {
        expect(interpretador.interpretar(entrada)).toMatchSnapshot('Interpretador Padrão');
        expect(interpretadorSegmentado.interpretar(entrada)).toMatchSnapshot('Interpretador Segmentado');
    }

    it('Deve interpretar lei', () => {
        // tslint:disable-next-line: max-line-length
        testar('O § 6º do art. 225 da Lei nº 6.763, de 26 de dezembro de 1975, passa a vigorar com a seguinte redação:');
    });

    it('Não deve confundir referência de artigos entre diferentes períodos.', () => {
        // tslint:disable-next-line: max-line-length
        const texto = 'Testando o art. 225. Veja a Lei nº 6.763, de 26 de dezembro de 1975.';
        const resultado = interpretador.interpretar(texto);

        expect(resultado[0].remissao.referencia).toBe(undefined);
    });

    it('Deve interpretar remissões do Decreto com Numeração Especial 471 de 23/09/2019', () => {
        testar(readFileSync('test/minas_gerais-decreto_com_numeracao_especial_471_2019.txt').toString());
    });
});
