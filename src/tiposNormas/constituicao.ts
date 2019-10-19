import ITipoNorma, { Autoridade } from './ITipoNorma';

const normas: ITipoNorma[] = [
    {
        local: 'br',
        autoridade: Autoridade.FEDERAL,
        tipo: 'Constituição Federal',
        sigla: 'CF',
        semNumero: true
    },
    {
        local: 'br',
        autoridade: Autoridade.FEDERAL,
        tipo: 'Constituição da República Federativa do Brasil',
        sigla: 'CRFB',
        semNumero: true
    },
    {
        autoridade: Autoridade.ESTADUAL,
        tipo: 'Constituição do Estado',
        sigla: 'CE',
        semNumero: true
    },
    {
        autoridade: Autoridade.ESTADUAL,
        tipo: 'Constituição Estadual',
        sigla: 'CE',
        semNumero: true
    },
    {
        autoridade: Autoridade.MUNICIPAL,
        tipo: 'Lei Orgânica',
        sigla: 'LO',
        semNumero: true
    }
];

export default normas;
