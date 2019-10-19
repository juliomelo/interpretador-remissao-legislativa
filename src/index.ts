import InterpretadorRemissao from './InterpretadorRemissao';
import minasGerais from './tiposNormas/minasGerais';

export default InterpretadorRemissao;
export * from './InterpretadorRemissao';
export * from './IRemissao';

const todasNormas = minasGerais;

export { todasNormas };
