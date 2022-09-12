/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @author Saul Navarro
 */

 define(['N/encode','N/runtime','N/url','N/record', 'N/redirect', 'N/ui/serverWidget', 'N/search', 'N/ui/message'], 
        (encode,runtime,url,record, redirect, serverWidget, search, message)=> {

       /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         * 
         * log.debug("",)
         * 
         */
    const onRequest=(context)=> {
     switch (context.request.method) {
        case 'GET':{ 
            let form = serverWidget.createForm({ title: 'Compensación de Facturas' });
            
            var mainTab = form.addSubtab({
                id: 'custpage_main_tab',
                label: "Lista de Facturas pendientes"
            });
            
            var campo_form= form.addField({
                id: 'custpage_fld1',
                type: serverWidget.FieldType.LABEL,
                label: 'TABLA SUPERIOR CUENTAS POR PAGAR \nY TABLA INFERIOR CUENTAS POR COBRAR',
                container:'custpage_main_tab'
            });
            
            let requestquoteSublist = form.addSublist({ id: 'custpage_ges_sublist_item', type: serverWidget.SublistType.LIST, label: 'CUENTAS POR PAGAR' ,tab:'custpage_main_tab'});
            [
                { id: 'custpage_cha_sub_marca', type: serverWidget.FieldType.CHECKBOX, label: 'Marcar', display_type: serverWidget.FieldDisplayType.INLINE },
                { id: 'custpage_cha_sub_fecha', type: serverWidget.FieldType.DATE, label: 'Fecha', display_type: serverWidget.FieldDisplayType.INLINE },
                { id: 'custpage_cha_sub_notransaccion', type: serverWidget.FieldType.TEXT, label: 'No. Transacciòn', display_type: serverWidget.FieldDisplayType.INLINE },
                { id: 'custpage_cha_sub_importe', type: serverWidget.FieldType.CURRENCY, label: 'Importe', display_type: serverWidget.FieldDisplayType.INLINE },
                { id: 'custpage_cha_sub_saldo', type: serverWidget.FieldType.CURRENCY, label: 'Saldo', display_type: serverWidget.FieldDisplayType.INLINE },
                { id: 'custpage_cha_sub_aplicacion', type: serverWidget.FieldType.CURRENCY, label: 'Aplicaciòn', display_type: serverWidget.FieldDisplayType.INLINE }]
                .map((el) => {
                    let field = requestquoteSublist.addField(el);
                    if (el.hasOwnProperty('display_type')) field.updateDisplayType({ displayType: el.display_type });
                    if (el.hasOwnProperty('default_value')) field.defaultValue = el.default_value;
                    
                });
                
                
                
                
                let requestquoteSublist2 = form.addSublist({ id: 'custpage_ges_sublist_item2', type: serverWidget.SublistType.LIST, label: 'CUENTAS POR COBRAR' ,tab: 'custpage_main_tab'});
                [
                    { id: 'custpage_cha_sub_marca2', type: serverWidget.FieldType.CHECKBOX, label: 'Marcar', display_type: serverWidget.FieldDisplayType.INLINE },
                    { id: 'custpage_cha_sub_fecha2', type: serverWidget.FieldType.DATE, label: 'Fecha', display_type: serverWidget.FieldDisplayType.INLINE },
                    { id: 'custpage_cha_sub_notransaccion2', type: serverWidget.FieldType.TEXT, label: 'No. Transacciòn', display_type: serverWidget.FieldDisplayType.INLINE },
                    { id: 'custpage_cha_sub_importe2', type: serverWidget.FieldType.CURRENCY, label: 'Importe', display_type: serverWidget.FieldDisplayType.INLINE },
                    { id: 'custpage_cha_sub_saldo2', type: serverWidget.FieldType.CURRENCY, label: 'Saldo', display_type: serverWidget.FieldDisplayType.INLINE },
            { id: 'custpage_cha_sub_aplicacion2', type: serverWidget.FieldType.CURRENCY, label: 'Aplicaciòn', display_type: serverWidget.FieldDisplayType.INLINE }]
            .map((el) => {
            let field = requestquoteSublist2.addField(el);
            if (el.hasOwnProperty('display_type')) field.updateDisplayType({ displayType: el.display_type });
            if (el.hasOwnProperty('default_value')) field.defaultValue = el.default_value;

        });


        form.addFieldGroup({ id: 'custpage_fields_header', label: 'Filtros de busqueda' });
        [
            { id: 'custpage_dt_proveedor', type: serverWidget.FieldType.SELECT, label: 'Proveedor', source: 'vendor', is_mandatory: true },
            { id: 'custpage_dt_rfc_proveedor', type: serverWidget.FieldType.TEXT, label: 'RFC Proveedor' },
            { id: 'custpage_dt_totalcxp', type: serverWidget.FieldType.CURRENCY, label: 'TOTAL CXP' },
            { id: 'custpage_dt_cliente', type: serverWidget.FieldType.SELECT, label: 'Cliente', source: 'customer', is_mandatory: true },
            { id: 'custpage_dt_rfc_cliente', type: serverWidget.FieldType.TEXT, label: 'RFC Clientes' },
            { id: 'custpage_dt_totalcxc', type: serverWidget.FieldType.CURRENCY, label: 'TOTAL CXC' }
        ].map((el) => {
            let field = form.addField(el)
            if (el.hasOwnProperty('is_mandatory') && el.is_mandatory) field.isMandatory = true;
        })


        form.addSubmitButton({ label: 'Realizar búsqueda' });
        
        context.response.writePage(form);
        break;
    }
        case 'POST':{
            let params = context.request.parameters;
            let submitter = params['submitter']
            if (submitter==="Generar Busqueda") {
                log.debug("Tirando data")
            }
            break;

        }
        }}

    return {onRequest};
//Area FunctionS
})