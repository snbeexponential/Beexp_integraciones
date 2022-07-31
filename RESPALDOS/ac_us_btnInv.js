/**
 * @author Evelyn Sarmiento Cámbara<>
 * @Modificacion <>
 * @Name ac_us_btnInv.js
 * @description Script para mostrar boton revision de inventario 
 * @file  <URL PENDIENTE>
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

 define(['N/url'], function (url) {

    const configuration = {};
    configuration.beforeLoad = function (context) {

        if (context.type !== context.UserEventType.CREATE) { return; }

        let form = context.form;
        let idScript = 'customscript_ac_sl_revisioninventario';
        let idDepploy = 'customdeploy_ac_sl_revisioninventario';

        let urlInvCheck = url.resolveScript({
            scriptId: idScript, deploymentId: idDepploy, returnExternalUrl: false,
            params: {
                opcion: 'invCheck',
                etiqueta: 'REVISAR INVENTARIO',
                idRecord: context.newRecord.id
            }
        })
        let scriptInvCheck = `require(['N/https'], function(https){window.open('${urlInvCheck}', 'Revisar Inventario','height=400,width=800');});`;

        let urlTest = url.resolveScript({
            scriptId: idScript, deploymentId: idDepploy, returnExternalUrl: false,
            params: { opcion: 'connect', etiqueta: 'PROBAR CONEXIÓN', idRecord: context.newRecord.id }
        })
        let scriptTest = `require(['N/https'], function(https){window.open('${urlTest}', 'Conexión de prueba','height=600,width=800');});`;

        form.addButton({ id: 'custpage_create_check_inv', label: 'Revisar Inventario', functionName: scriptInvCheck });
    };

    return configuration;
});