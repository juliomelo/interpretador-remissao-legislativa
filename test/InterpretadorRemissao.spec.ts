import InterpretadorRemissao from '../src/InterpretadorRemissao';
import minasGerais from '../src/tiposNormas/minasGerais';

describe('InterpretadorRemissao', () => {
    const interpretador = new InterpretadorRemissao(minasGerais);
    
    it('Deve interpretar lei', () => {
        // tslint:disable-next-line: max-line-length
        const texto = 'O § 6º do art. 225 da Lei nº 6.763, de 26 de dezembro de 1975, passa a vigorar com a seguinte redação:';
        const resultado = interpretador.interpretar(texto);

        expect(resultado).toMatchSnapshot();
    });
});
