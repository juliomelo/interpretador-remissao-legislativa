import ITipoNorma from '../ITipoNorma';

const normas: ITipoNorma[] = [
    {
        ambito: 'Federal',
        tipo: 'Constituição Federal',
        sigla: 'CF',
        semNumero: true
    },
    {
        ambito: 'Federal',
        tipo: 'Constituição da República Federativa do Brasil',
        sigla: 'CRFB',
        semNumero: true
    },
    {
        ambito: 'Estadual',
        tipo: 'Constituição do Estado',
        sigla: 'CE',
        semNumero: true
    },
    {
        ambito: 'Federal',
        tipo: 'Constituição Estadual',
        sigla: 'CE',
        semNumero: true
    },
    {
        ambito: 'Municipal',
        tipo: 'Lei Orgânica',
        sigla: 'LO',
        semNumero: true
    }
];

export default normas;
