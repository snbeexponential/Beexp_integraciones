/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record',"N/ui/serverWidget"],
    /**
 * @param{record} record
 */
    (record,ui) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
      /*       
            let type = scriptContext.type
            log.debug("el tipo",type)
            
            let formulario= scriptContext.newRecord     
            
            
            let id=formulario.getValue({
                fieldId:"id"
            })

            if (id) {
                       let form=scriptContext.form
            
            let minutaObj=record.load({
                type:"customrecord_minutas",
                id:id
            })

            let numLines = minutaObj.getLineCount({
                sublistId:'recmachcustrecord_camp_con'
            });


            log.debug("biforeload"+id) */


           /*  if (type == 'edit'||type == 'save'||type == 'view')
            {
            //Agregando un nuevo tab
            var sampleTab = form.addTab('custpage_sample_tab', 'Sample Tab');
        
            //Agregando un campo an lunevo tab
            var newFieldEmail = form.addField({
                id:'custpage_field_email', 
                label:'email',
                type:ui.FieldType.EMAIL,
                source: null, 
                container:'custpage_sample_tab'});   
        
            //Agregando un segundo campo al tab
            var newFieldText = form.addField(
              {  
                    id:'custpage_field_text', 
                    label:'Details',
                    type:'textarea',
                    source:null, 
                    container:'custpage_sample_tab'});
        
            //Agregar un subtab al primer tab subtab to the first tab
            log.debug("Tipo de dato",typeof(form))
            var sampleSubTab = form.addSubtab(
                {id:'custpage_sample_subtab',
                label: 'Sample Subtab',
                tab:'custpage_sample_tab'});

            //Agregando un select field al subtab
          var newSubField = form.addField({
            id:'custpage_sample_field',
            label: 'My Customers',
            type: 'select',
            source: 'customer',
            container:'custpage_sample_subtab'});

            //Agregando un segundo subtab
            var sampleSubTab = form.addSubtab({
            id:'custpage_sample_subtab2',
            label:'Second Sample Subtab',
            tab:'custpage_sample_tab'});

            //Agregando segundo subtab al tab principal
            var newSubField = form.addField({
                id:'custpage_sample_field2',
                type: 'select',
                label: 'My Employees',
                source: 'employee',
                container:'custpage_sample_subtab2'});
            } */

/* 
            for (let i = 0; i < numLines; i++) {


                let id_act = minutaObj.getSublistValue({
                    sublistId:"recmachcustrecord_camp_con",
                    fieldId:"id",
                    line:i
                })
                let nombre_act = minutaObj.getSublistValue({
                    sublistId:"recmachcustrecord_camp_con",
                    fieldId:"custrecord_campo_sl_1",
                    line:i
                })
                log.debug("Valores de Temas abarcados",nombre_act+"-----"+id_act+"Desde BEFORE")

                form.addTab("custpage_"+id_act,"demo");

                form.addField({
                    id :'custpage_'+"tab_"+id_act,
                   type:"textarea",
                   label: 'Tab Field'
              });

              var sampleSubTab = form.addSubTab('custpage_sample_subtab', 'Sample Subtab',
              'custpage_sample_tab');
                log.debug("The campos")

        } 
        
            }*/
    }
    
        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            
      
            }

            

       

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
