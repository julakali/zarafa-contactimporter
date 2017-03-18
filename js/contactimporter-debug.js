/**
 * ABOUT.js zarafa contact to vcf im/exporter
 *
 * Author: Christoph Haas <christoph.h@sprinternet.at>
 * Copyright (C) 2012-2013 Christoph Haas
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 */
 
Ext.namespace('Zarafa.plugins.contactimporter');

/**
 * @class Zarafa.plugins.contactimporter.ABOUT
 * @extends String
 *
 * The copyright string holding the copyright notice for the Zarafa contactimporter Plugin.
 */
Zarafa.plugins.contactimporter.ABOUT = ""
	+ "<p>Copyright (C) 2012-2013  Christoph Haas &lt;christoph.h@sprinternet.at&gt;</p>"

	+ "<p>This program is free software; you can redistribute it and/or "
	+ "modify it under the terms of the GNU Lesser General Public "
	+ "License as published by the Free Software Foundation; either "
	+ "version 2.1 of the License, or (at your option) any later version.</p>"

	+ "<p>This program is distributed in the hope that it will be useful, "
	+ "but WITHOUT ANY WARRANTY; without even the implied warranty of "
	+ "MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU "
	+ "Lesser General Public License for more details.</p>"

	+ "<p>You should have received a copy of the GNU Lesser General Public "
	+ "License along with this program; if not, write to the Free Software "
	+ "Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA</p>"

	+ "<hr />"

	+ "<p>The contactimporter plugin contains the following third-party components:</p>"
	
	+ "<h1>vCard-parser</h1>"

	+ "<p>Copyright (C) 2012 Nuovo</p>"

	+ "<p>Licensed under the MIT License.</p>"
	
	+ "<p>Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an \"AS IS\" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.</p>"/**
 * plugin.contactimporter.js zarafa contactimporter
 *
 * Author: Christoph Haas <christoph.h@sprinternet.at>
 * Copyright (C) 2012-2013 Christoph Haas
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 */
 
Ext.namespace("Zarafa.plugins.contactimporter");									// Assign the right namespace

Zarafa.plugins.contactimporter.ImportPlugin = Ext.extend(Zarafa.core.Plugin, {		// create new import plugin

    /**
     * @constructor
     * @param {Object} config Configuration object
     *
     */
	constructor: function (config) {
		config = config || {};
				
		Zarafa.plugins.contactimporter.ImportPlugin.superclass.constructor.call(this, config);
	},
	
	/**
	 * initialises insertion point for plugin
	 * @protected
	 */
	initPlugin : function()	{
		Zarafa.plugins.contactimporter.ImportPlugin.superclass.initPlugin.apply(this, arguments);
		
		/* our panel */
		Zarafa.core.data.SharedComponentType.addProperty('plugins.contactimporter.dialogs.importcontacts');
		
		/* directly import received vcfs */
		this.registerInsertionPoint('common.contextmenu.attachment.actions', this.createAttachmentImportButton);
		/* add import button to south navigation */
		this.registerInsertionPoint("navigation.south", this.createImportButton, this);
	},
	
    /**
     * Creates the button
     *
     * @return {Object} Configuration object for a {@link Ext.Button button}
     * 
     */
	createImportButton: function () {
		var button = {
			xtype				: 'button',
			id		  			: "importcontactsbutton",
			text				: _('Import Contacts'),
			iconCls				: 'icon_contactimporter_button',
			navigationContext	: container.getContextByName('contact'),
			handler				: this.onImportButtonClick,
			scope				: this
		};
		
		if(container.getSettingsModel().get("zarafa/v1/plugins/contactimporter/enable_export")) {
			button.text = _('Import/Export Contacts');
		}
		
		return  button;
	},
	
	/**
	 * Insert import button in all attachment suggestions
	 
	 * @return {Object} Configuration object for a {@link Ext.Button button}
	 */
	createAttachmentImportButton : function(include, btn) {
		return {
			text 		: _('Import Contacts'),
			handler 	: this.getAttachmentFileName.createDelegate(this, [btn, this.gotAttachmentFileName]),
			scope		: this,
			iconCls		: 'icon_contactimporter_button',
			beforeShow 	: function(item, record) {
				var extension = record.data.name.split('.').pop().toLowerCase();
				
				if(record.data.filetype  == "text/vcard" || extension == "vcf" || extension == "vcard") {
					item.setDisabled(false);
				} else {
					item.setDisabled(true);
				}
			}
		};
	},
	
	/**
	 * Callback for getAttachmentFileName
	 */
	gotAttachmentFileName: function(response) {
		if(response.status == true) {
			Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.core.data.SharedComponentType['plugins.contactimporter.dialogs.importcontacts'], undefined, {
				manager : Ext.WindowMgr,
				filename : response.tmpname
			});
		} else {
			Zarafa.common.dialogs.MessageBox.show({
				title   : _('Error'),
				msg     : _(response["message"]),
				icon    : Zarafa.common.dialogs.MessageBox.ERROR,
				buttons : Zarafa.common.dialogs.MessageBox.OK
			});
		}
	},

	/**
	 * Clickhandler for the button
	 */
	getAttachmentFileName: function (btn, callback) {
		Zarafa.common.dialogs.MessageBox.show({
			title: 'Please wait',
			msg: 'Loading attachment...',
			progressText: 'Initializing...',
			width:300,
			progress:true,
			closable:false
		});

		// progress bar... ;)
		var f = function(v){
			return function(){
				if(v == 100){
					Zarafa.common.dialogs.MessageBox.hide();
				}else{
					Zarafa.common.dialogs.MessageBox.updateProgress(v/100, Math.round(v)+'% loaded');
				}
		   };
		};
		
		for(var i = 1; i < 101; i++){
			setTimeout(f(i), 20*i);
		}
		
		/* store the attachment to a temporary folder and prepare it for uploading */
		var attachmentRecord = btn.records;
		var attachmentStore = attachmentRecord.store;
		
		var store = attachmentStore.getParentRecord().get('store_entryid');
		var entryid = attachmentStore.getAttachmentParentRecordEntryId();
		var attachNum = new Array(1);
		if (attachmentRecord.get('attach_num') != -1)
			attachNum[0] = attachmentRecord.get('attach_num');
		else
			attachNum[0] = attachmentRecord.get('tmpname');
		var dialog_attachments = attachmentStore.getId();
		var filename = attachmentRecord.data.name;
		
		var responseHandler = new Zarafa.plugins.contactimporter.data.ResponseHandler({
			successCallback: callback
		});
		
		// request attachment preperation
		container.getRequest().singleRequest(
			'contactmodule',
			'importattachment',
			{
				entryid : entryid,
				store: store,
				attachNum: attachNum,
				dialog_attachments: dialog_attachments,
				filename: filename
			},
			responseHandler
		);
	},
	
	/**
	 * Clickhandler for the button
	 */
	onImportButtonClick: function () {
		Ext.getCmp("importcontactsbutton").disable();
		Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.core.data.SharedComponentType['plugins.contactimporter.dialogs.importcontacts'], undefined, {
			manager : Ext.WindowMgr
		});
	},
		
	/**
	 * Bid for the type of shared component
	 * and the given record.
	 * This will bid on calendar.dialogs.importcontacts
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Ext.data.Record} record Optionally passed record.
	 * @return {Number} The bid for the shared component
	 */
	bidSharedComponent : function(type, record) {
		var bid = -1;
		switch(type) {
			case Zarafa.core.data.SharedComponentType['plugins.contactimporter.dialogs.importcontacts']:
				bid = 2;
				break;
		}
		return bid;
	},

	/**
	 * Will return the reference to the shared component.
	 * Based on the type of component requested a component is returned.
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Ext.data.Record} record Optionally passed record.
	 * @return {Ext.Component} Component
	 */
	getSharedComponent : function(type, record) {
		var component;
		switch(type) {
			case Zarafa.core.data.SharedComponentType['plugins.contactimporter.dialogs.importcontacts']:
				component = Zarafa.plugins.contactimporter.dialogs.ImportContentPanel;
				break;
		}

		return component;
	}
});


/*############################################################################################################################
 * STARTUP 
 *############################################################################################################################*/
Zarafa.onReady(function() {
	container.registerPlugin(new Zarafa.core.PluginMetaData({
		name : 'contactimporter',
		displayName : _('Contactimporter Plugin'),
		about : Zarafa.plugins.contactimporter.ABOUT,
		pluginConstructor : Zarafa.plugins.contactimporter.ImportPlugin
	}));
});
/**
 * ResponseHandler.js zarafa contact im/exporter
 *
 * Author: Christoph Haas <christoph.h@sprinternet.at>
 * Copyright (C) 2012-2013 Christoph Haas
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 */
 
/**
 * ResponseHandler
 *
 * This class handles all responses from the php backend
 */
Ext.namespace('Zarafa.plugins.contactimporter.data');

/**
 * @class Zarafa.plugins.contactimporter.data.ResponseHandler
 * @extends Zarafa.plugins.contactimporter.data.AbstractResponseHandler
 *
 * Calendar specific response handler.
 */
Zarafa.plugins.contactimporter.data.ResponseHandler = Ext.extend(Zarafa.core.data.AbstractResponseHandler, {
	/**
	 * @cfg {Function} successCallback The function which
	 * will be called after success request.
	 */
	successCallback : null,
		
	/**
	 * Call the successCallback callback function.
	 * @param {Object} response Object contained the response data.
	 */
	doLoad : function(response) {
		this.successCallback(response);
	},
	
	/**
	 * Call the successCallback callback function.
	 * @param {Object} response Object contained the response data.
	 */
	doImport : function(response) {
		this.successCallback(response);
	},
	
	/**
	 * Call the successCallback callback function.
	 * @param {Object} response Object contained the response data.
	 */
	doImportattachment : function(response) {
		this.successCallback(response);
	},
		
	/**
	 * In case exception happened on server, server will return
	 * exception response with the code of exception.
	 * @param {Object} response Object contained the response data.
	 */
	doError: function(response)	{
		alert("error response code: " + response.error.info.code);
	}
});

Ext.reg('contactimporter.contactresponsehandler', Zarafa.plugins.contactimporter.data.ResponseHandler);/**
 * ImportContentPanel.js zarafa contact to vcf im/exporter
 *
 * Author: Christoph Haas <christoph.h@sprinternet.at>
 * Copyright (C) 2012-2013 Christoph Haas
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 */
 
/**
 * ImportContentPanel
 *
 * Container for the importpanel.
 */
Ext.namespace("Zarafa.plugins.contactimporter.dialogs"); 

/**
 * @class Zarafa.plugins.contactimporter.dialogs.ImportContentPanel
 * @extends Zarafa.core.ui.ContentPanel
 *
 * The content panel which shows the hierarchy tree of Owncloud account files.
 * @xtype contactimportercontentpanel
 */
Zarafa.plugins.contactimporter.dialogs.ImportContentPanel = Ext.extend(Zarafa.core.ui.ContentPanel, {

	/**
	 * @constructor
	 * @param config Configuration structure
	 */
	constructor : function(config) {
		config = config || {};
		var title = _('Import Contacts');
		if(container.getSettingsModel().get("zarafa/v1/plugins/contactimporter/enable_export")){
			title = _('Import/Export Contacts');
		}
		Ext.applyIf(config, {
			layout		: 'fit',
			title		: title,
			closeOnSave	: true,
			width		: 620,
			height		: 465,
			//Add panel
			items : [
				{
					xtype	 : 'contactimporter.importcontactpanel',
					filename : config.filename 
				}
			]
		});

		Zarafa.plugins.contactimporter.dialogs.ImportContentPanel.superclass.constructor.call(this, config);
	}

});

Ext.reg('contactimporter.contentpanel' ,Zarafa.plugins.contactimporter.dialogs.ImportContentPanel);/**
 * ImportPanel.js zarafa contact to vcf im/exporter
 *
 * Author: Christoph Haas <christoph.h@sprinternet.at>
 * Copyright (C) 2012-2013 Christoph Haas
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *	
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 */

/**
 * ImportPanel
 *
 * The main Panel of the contactimporter plugin.
 */
Ext.namespace("Zarafa.plugins.contactimporter.dialogs"); 

/**
 * @class Zarafa.plugins.contactimporter.dialogs.ImportPanel
 * @extends Ext.form.FormPanel
 */
Zarafa.plugins.contactimporter.dialogs.ImportPanel = Ext.extend(Ext.Panel, {

	/* path to vcf file on server... */
	vcffile: null,
	
	/* The store for the selection grid */
	store: null,

	/**
	 * @constructor
	 * @param {object} config
	 */
	constructor : function (config) {
		config = config || {};
		var self = this;
		
		if(typeof config.filename !== "undefined") {
			this.vcffile = config.filename;
		}
		
		// create the data store
		// we only display the firstname, lastname, homephone and primary email address in our grid
		this.store = new Ext.data.ArrayStore({
			fields: [
				{name: 'display_name'},
				{name: 'given_name'},
				{name: 'surname'},
				{name: 'company_name'},
				{name: 'record'}
			]
		});
		
		Ext.apply(config, {
			xtype     : 'contactimporter.importpanel',
			ref		  : "importcontactpanel",
			layout    : {
				type  : 'form',
				align : 'stretch'
			},
			anchor	  : '100%',
			bodyStyle : 'background-color: inherit;',
			defaults  : {
				border      : true,
				bodyStyle   : 'background-color: inherit; padding: 3px 0px 3px 0px; border-style: none none solid none;'
			},
			items : [
				this.createSelectBox(),
				this.initForm(),
				this.createGrid()
			],
			buttons: [
				this.createSubmitAllButton(),
				this.createSubmitButton(),
				this.createCancelButton()
			], 
			listeners: {
				afterrender: function (cmp) {
					this.loadMask = new Ext.LoadMask(this.getEl(), {msg:'Loading...'});
					
					if(this.vcffile != null) { // if we have got the filename from an attachment
						this.parseContacts(this.vcffile);
					}
				},
				close: function (cmp) {
					Ext.getCmp("importcontactsbutton").enable();
				},
				hide: function (cmp) {
					Ext.getCmp("importcontactsbutton").enable();
				},
				destroy: function (cmp) {
					Ext.getCmp("importcontactsbutton").enable();
				},
				scope: this
			}
		});
		
		Zarafa.plugins.contactimporter.dialogs.ImportPanel.superclass.constructor.call(this, config);
	},

	/**
	 * Init embedded form, this is the form that is
	 * posted and contains the attachments
	 * @private
	 */
	initForm : function () {
		return {
			xtype: 'form',
			ref: 'addContactFormPanel',
			layout : 'column',
			fileUpload: true,
			autoWidth: true,
			autoHeight: true,
			border: false,
			bodyStyle: 'padding: 5px;',
			defaults: {
				anchor: '95%',
				border: false,
				bodyStyle: 'padding: 5px;'
			},
			items: [this.createUploadField()]
		};
	},

	/**
	 * Reloads the data of the grid
	 * @private
	 */
	reloadGridStore: function(contactdata) {
		var parsedData = [];
				
		if(contactdata) {
			parsedData = new Array(contactdata.contacts.length);
			var i = 0;
			for(i = 0; i < contactdata.contacts.length; i++) {
				
				parsedData[i] = new Array(
					contactdata.contacts[i]["display_name"],
					contactdata.contacts[i]["given_name"],
					contactdata.contacts[i]["surname"],
					contactdata.contacts[i]["company_name"],
					contactdata.contacts[i]
				);
			}
		} else {
			return null;
		}

		this.store.loadData(parsedData, false);
	},
	
	/**
	 * Init embedded form, this is the form that is
	 * posted and contains the attachments
	 * @private
	 */
	createGrid : function() {
		return {
			xtype: 'grid',
			ref: 'contactGrid',
			columnWidth: 1.0,
			store: this.store,
			width: '100%',
			height: 300,
			title: 'Select contacts to import',
			frame: false,
			viewConfig:{
				forceFit:true
			},
			colModel: new Ext.grid.ColumnModel({
				defaults: {
					width: 300,
					sortable: true
				},
				columns: [
					{id: 'Displayname', header: 'Displayname', width: 350, sortable: true, dataIndex: 'display_name'},
					{header: 'Firstname', width: 200, sortable: true, dataIndex: 'given_name'},
					{header: 'Lastname', width: 200, sortable: true, dataIndex: 'surname'},
					{header: 'Company', sortable: true, dataIndex: 'company_name'}
				]
			}),
			sm: new Ext.grid.RowSelectionModel({multiSelect:true})
		}
	},
	
	createSelectBox: function() {
		var defaultFolder = container.getHierarchyStore().getDefaultFolder('contact'); // @type: Zarafa.hierarchy.data.MAPIFolderRecord
		var subFolders = defaultFolder.getChildren();
		var myStore = [];
		
		/* add all local contact folders */
		var i = 0;
		myStore.push(new Array(defaultFolder.getDefaultFolderKey(), defaultFolder.getDisplayName()));
		for(i = 0; i < subFolders.length; i++) {
			/* Store all subfolders */
			myStore.push(new Array(subFolders[i].getDisplayName(), subFolders[i].getDisplayName(), false)); // 3rd field = isPublicfolder
		}
		
		/* add all shared contact folders */
		var pubStore = container.getHierarchyStore().getPublicStore();
		
		if(typeof pubStore !== "undefined") {
			try {
				var pubFolder = pubStore.getDefaultFolder("publicfolders");
				var pubSubFolders = pubFolder.getChildren();
				for(i = 0; i < pubSubFolders.length; i++) {
					if(pubSubFolders[i].isContainerClass("IPF.Contact")){
						myStore.push(new Array(pubSubFolders[i].getDisplayName(), pubSubFolders[i].getDisplayName() + " [Shared]", true)); // 3rd field = isPublicfolder
					}
				}
			} catch (e) {
				console.log("Error opening the shared folder...");
				console.log(e);
			}
		}
		
		return {
			xtype: "selectbox",
			ref: 'addressbookSelector', 
			editable: false,
			name: "choosen_addressbook",
			value: container.getSettingsModel().get("zarafa/v1/plugins/contactimporter/default_addressbook"),
			width: 100,
			fieldLabel: "Select an addressbook",
			store: myStore,
			mode: 'local',
			labelSeperator: ":",
			border: false,
			anchor: "100%",
			scope: this,
			allowBlank: false
		}
	},
	
	createUploadField: function() {
		return {
			xtype: "fileuploadfield",
			ref: 'contactfileuploadfield',
			columnWidth: 1.0,
			id: 'form-file',    
			name: 'vcfdata',
			emptyText: 'Select an .vcf addressbook',
			border: false,
			anchor: "100%",
			scope: this,
			allowBlank: false,
			listeners: {
				'fileselected': this.onFileSelected,
				scope: this
			}
		}
	},
	
	createSubmitButton: function() {
		return {
			xtype: "button",
			ref: "../submitButton",
			disabled: true,
			width: 100,
			border: false,
			text: _("Import"),
			anchor: "100%",
			handler: this.importCheckedContacts,
			scope: this,
			allowBlank: false
		}
	},
	
	createSubmitAllButton: function() {
		return {
			xtype: "button",
			ref: "../submitAllButton",
			disabled: true,
			width: 100,
			border: false,
			text: _("Import All"),
			anchor: "100%",
			handler: this.importAllContacts,
			scope: this,
			allowBlank: false
		}
	},
	
	createCancelButton: function() {
		return {
			xtype: "button",
			width: 100,
			border: false,
			text: _("Cancel"),
			anchor: "100%",
			handler: this.close,
			scope: this,
			allowBlank: false
		}
	},
	
	/**
	 * This is called when a file has been seleceted in the file dialog
	 * in the {@link Ext.ux.form.FileUploadField} and the dialog is closed
	 * @param {Ext.ux.form.FileUploadField} uploadField being added a file to
	 */
	onFileSelected : function(uploadField) {
		var form = this.addContactFormPanel.getForm();

		if (form.isValid()) {
			form.submit({
				waitMsg: 'Uploading and parsing contacts...',
				url: 'plugins/contactimporter/php/upload.php',
				failure: function(file, action) {
					this.submitButton.disable();
					this.submitAllButton.disable();
					Zarafa.common.dialogs.MessageBox.show({
						title   : _('Error'),
						msg     : _(action.result.error),
						icon    : Zarafa.common.dialogs.MessageBox.ERROR,
						buttons : Zarafa.common.dialogs.MessageBox.OK
					});
				},
				success: function(file, action){
					uploadField.reset();
					this.vcffile = action.result.vcf_file;
					
					this.parseContacts(this.vcffile);
				},
				scope : this
			});
		}
	},
	
	parseContacts: function (vcfPath) {
		this.loadMask.show();
		
		// call export function here!
		var responseHandler = new Zarafa.plugins.contactimporter.data.ResponseHandler({
			successCallback: this.handleParsingResult.createDelegate(this)
		});
		
		container.getRequest().singleRequest(
			'contactmodule',
			'load',
			{
				vcf_filepath: vcfPath
			},
			responseHandler
		);
	},
	
	handleParsingResult: function(response) {
		this.loadMask.hide();
		
		if(response["status"] == true) {
			this.submitButton.enable();
			this.submitAllButton.enable();
			
			this.reloadGridStore(response.parsed);
		} else {
			this.submitButton.disable();
			this.submitAllButton.disable();
			Zarafa.common.dialogs.MessageBox.show({
				title   : _('Parser Error'),
				msg     : _(response["message"]),
				icon    : Zarafa.common.dialogs.MessageBox.ERROR,
				buttons : Zarafa.common.dialogs.MessageBox.OK
			});
		}
	},

	close: function () {
		this.addContactFormPanel.getForm().reset();
		this.dialog.close()
	},

	importCheckedContacts: function () {
		var newRecords = this.contactGrid.selModel.getSelections();
		this.importContacts(newRecords);
    },

	importAllContacts: function () {
		//receive Records from grid rows
		this.contactGrid.selModel.selectAll();  // select all entries
		var newRecords = this.contactGrid.selModel.getSelections();
		this.importContacts(newRecords);
    },
	
	/** 
	 * This function stores all given events to the appointmentstore 
	 * @param events
	 */
	importContacts: function (contacts) {
		//receive existing contact store
		var folderValue = this.addressbookSelector.getValue();

		if(folderValue == undefined) { // no addressbook choosen
			Zarafa.common.dialogs.MessageBox.show({
				title   : _('Error'),
				msg     : _('You have to choose an addressbook!'),
				icon    : Zarafa.common.dialogs.MessageBox.ERROR,
				buttons : Zarafa.common.dialogs.MessageBox.OK
			});
		} else {
			var addressbookexist = true;
			if(this.contactGrid.selModel.getCount() < 1) {
				Zarafa.common.dialogs.MessageBox.show({
					title   : _('Error'),
					msg     : _('You have to choose at least one contact to import!'),
					icon    : Zarafa.common.dialogs.MessageBox.ERROR,
					buttons : Zarafa.common.dialogs.MessageBox.OK
				});
			} else {
				var contactStore = new Zarafa.contact.ContactStore();
				var contactFolder =  container.getHierarchyStore().getDefaultFolder('contact');
				var pubStore = container.getHierarchyStore().getPublicStore();
				var pubFolder = pubStore.getDefaultFolder("publicfolders");
				var pubSubFolders = pubFolder.getChildren();
			
				if(folderValue != "contact") {
					var subFolders = contactFolder.getChildren();
					var i = 0;
					for(i = 0; i < pubSubFolders.length; i++) {
						if(pubSubFolders[i].isContainerClass("IPF.Contact")){
							subFolders.push(pubSubFolders[i]);
						}
					}
					for(i=0;i<subFolders.length;i++) {
						// look up right folder 
						// TODO: improve!!
						if(subFolders[i].getDisplayName() == folderValue) {
							contactFolder = subFolders[i];
							break;
						}
					}
					
					if(contactFolder.isDefaultFolder()) {
						Zarafa.common.dialogs.MessageBox.show({
							title   : _('Error'),
							msg     : _('Selected addressbook does not exist!'),
							icon    : Zarafa.common.dialogs.MessageBox.ERROR,
							buttons : Zarafa.common.dialogs.MessageBox.OK
						});
						addressbookexist = false;
					}
				}

				if(addressbookexist) {
					this.loadMask.show();
					var uids = new Array();
					var store_entryid = "";
					
					//receive Records from grid rows
					Ext.each(contacts, function(newRecord) {
						uids.push(newRecord.data.record.internal_fields.contact_uid);						
					}, this);
					store_entryid = contactFolder.get('store_entryid');
					
					var responseHandler = new Zarafa.plugins.contactimporter.data.ResponseHandler({
						successCallback: this.importContactsDone.createDelegate(this)
					});
					
					container.getRequest().singleRequest(
						'contactmodule',
						'import',
						{
							storeid: contactFolder.get("store_entryid"),
							folderid: contactFolder.get("entryid"),
							uids: uids,
							vcf_filepath: this.vcffile
						},
						responseHandler
					);
					
				}
			}
		}
	},
	
	importContactsDone : function (response) {
		console.log(response);
		this.loadMask.hide();
		this.dialog.close();
		if(response.status == true) {
			container.getNotifier().notify('info', 'Imported', 'Imported ' + response.count + ' contacts. Please reload your addressbook!');
		} else {
			Zarafa.common.dialogs.MessageBox.show({
				title   : _('Error'),
				msg     : _('Import failed: ') + response.message,
				icon    : Zarafa.common.dialogs.MessageBox.ERROR,
				buttons : Zarafa.common.dialogs.MessageBox.OK
			});
		}
	}
});

Ext.reg('contactimporter.importcontactpanel', Zarafa.plugins.contactimporter.dialogs.ImportPanel);
