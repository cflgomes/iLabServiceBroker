/*
 * Copyright (c) 2013, Samuel Colbran <contact@samuco.net>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 
 * Redistributions in binary form must reproduce the above copyright notice, this
 * list of conditions and the following disclaimer in the documentation and/or
 * other materials provided with the distribution.
 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function()
{
    var root = module.exports;
	var config = require('../config')
	var crypto = require('crypto')
	var parseString = require('xml2js').parseString;

	function hmacsha1(key, text)
	{
   		return crypto.createHmac('sha1', key).update(text).digest('base64')
	}

	XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	iLabServer.prototype.sendActionToServer = function(data_dictionary, callback)
	{
		data_dictionary['time-stamp'] = new Date().getTime();
		data_dictionary['guid']  = this.params.guid;
		data_dictionary['token'] = '';
		data_dictionary['auth'] = 'token';

		var dictionaryAttribute = JSON.stringify(data_dictionary);
		var computedSignature = hmacsha1(this.params.passkey, this.params.guid+dictionaryAttribute);

		data_dictionary['token'] = computedSignature;

		var xhr = new XMLHttpRequest();
		xhr.open('get',"http://"+ this.params.host+":"+ this.params.port+"/json", true);
		xhr.setRequestHeader("Content-Type", "application/json");
		
		xhr.onerror = function(e)
		{
			callback('', xhr.statusText);
		};

		xhr.onload = function()
		{
			var xmlDoc = xhr.responseText;
			var jsonResponse = JSON.parse(xmlDoc);
	
			callback(jsonResponse, '');
		}

		var json_data = JSON.stringify(data_dictionary);
		xhr.send(json_data);
	}

	//Print out the accepted SOAP methods
	function iLabServer(params)
	{
		//Connect to the iLab
		if (config.verbose) console.log("Connecting to iLab " + params.host);
		if (config.debug) console.log(params.host + '/'+params.service);
		this.params = params;
		console.log("REST: Connecting (" + this.params.host + ")");
		return this;
	}

	iLabServer.prototype.printMethods = function (){
		console.log("This method is unsupported by the modern ilab class");
	}
	
	//Returns the queue length for the lab server. 
	//Arguments: userGroup, priority (from -20 to 20), function(length, wait, err)
	iLabServer.prototype.getEffectiveQueueLength = function (userGroup, priorityHint, callback)
	{
		this.sendActionToServer({action:"getEffectiveQueueLength", params:{userGroup: userGroup, priorityHint: priorityHint}}, callback);
	}

	//Returns the lab configuration in xml format.
	//Arguments: function(xml, err)
	iLabServer.prototype.getLabConfiguration = function getLabConfiguration(callback)
	{
		this.sendActionToServer({action:"getLabConfiguration"}, callback);
	}

	//Returns the lab status.
	//Arguments: function(message, keys, err)
	iLabServer.prototype.getLabStatus = function (callback)
	{
		this.sendActionToServer({action:"getLabStatus"}, callback);
	}

	/*
	NEW METHODS
	cancel(id, experimentID)
	getExperimentStatus(id, experimentID)
	retrieveResult(id, experimentID)
	submit(id, experimentID, experimentSpecification, userGroup, priorityHint)
	validate(id, experimentSpecification, userGroup)
	*/

	//Cancels a previously submitted experiment
	//If the experiment is already running, makes best efforts to abort execution, but there is no guarantee that the experiment will not run to completion
	//Arguments: experimentID, function(obj, err)
	iLabServer.prototype.cancel = function (experimentID, callback)
	{
		this.sendActionToServer({action:"cancel", params:{experimentID: experimentID}}, callback);
	}

	//Checks on the status of a previously submitted experiment.
	//Arguments: experimentID, function(obj, err)
	iLabServer.prototype.getExperimentStatus = function (experimentID, callback)
	{
		this.sendActionToServer({action:"getExperimentStatus", params:{experimentID: experimentID}}, callback);
	}

	//Retrieves the results from (or errors generated by) a previously submitted experiment.
	//Arguments: experimentID, function(obj, err)
	iLabServer.prototype.retrieveResult = function (experimentID, callback)
	{
		this.sendActionToServer({action:"retrieveResult", params:{experimentID: experimentID}}, callback);
	}

	//Submits an experiment specification to the lab server for execution.
	//Arguments: experimentID, experimentSpecification, userGroup, priorityHint, function(obj, err)
	iLabServer.prototype.submit = function (experimentID, experimentSpecification, userGroup, priorityHint, callback)
	{
		experimentSpecification = experimentSpecification.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;')

		this.sendActionToServer({action:"submit", params:{experimentID: experimentID,
										  experimentSpecification: experimentSpecification,
														userGroup: userGroup,
													 priorityHint: priorityHint}}, callback);
	}

	//Checks whether an experiment specification would be accepted if submitted for execution. 
	//Arguments: experimentSpecification, userGroup, function(obj, err)
	iLabServer.prototype.validate = function (experimentSpecification, userGroup, callback)
	{
		experimentSpecification = experimentSpecification.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;')

		this.sendActionToServer({action:"validate", params:{experimentSpecification: experimentSpecification,
											  			             userGroup: userGroup}}, callback);
	}

	root.iLabServer = iLabServer;
	return root;
})();
