import ITipoNorma from './tiposNormas/ITipoNorma';

export default interface IIdentificadorNorma {
    tipo: ITipoNorma;
    numero?: number;
    ano?: number;
}
