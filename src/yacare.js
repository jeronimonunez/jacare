// yacare.js

(function ( $ ) {

	$.fn.terminalLog = function( options ) {
		var settings = $.extend({
			style: 'top'
		}, options);

		var $element = this;
        var $wrapper = $element.children(".log-wrapper");
		$element.addClass('ignited');

		return {
			push: function( text ) {
				$wrapper.append("<div>" + text + "</div>");
	        	$element.scrollTop($wrapper.height());
			},
			clean: function() {
				$wrapper.html('');
			}
		};
	};
 
    $.fn.yacare = function( options ) {

    	var log;

    	var cleanLog = function() {
    		log.clean();
    	};

    	var printVersion = function() {
    		log.push( version );
    	};

    	var retrieveCommandList = function() {
    		return _.map(commandList, 'name');
    	};
 
        var commandList = [
        	{
        		name: 'list',
        		exec: function() { 
        			log.push( retrieveCommandList() ); 
        		},
        		phrase: "List available commands",
        		delay: 0,
        		arguments: []
        	},
        	{
        		name: 'alert',
    			exec: function( text ) {
    				alert( text );
    			},
    			phrase: "Check the alert",
    			delay: 0,
    			arguments: ["string"],
    		},
    		{
    			name: 'clean',
    			exec: cleanLog,
    			phrase: "Clean the log please",
    			delay: 0,
    			arguments: []
    		},
    		{
    			name: 'version',
    			exec: printVersion,
    			phrase: "Print the version please",
    			delay: 0,
    			arguments: []
    		}
        ];

    	var commandMatch = function( command ) {
    		console.log( retrieveCommandList(), command );
    		console.log(_.indexOf( retrieveCommandList(), command ));
    		return _.indexOf( retrieveCommandList(), command ) >= 0;
    	};

        var settings = $.extend({
            style: 'static',
    		backgroundColor: '#000',
    		width: '400px',
    		greetings: 'Welcome to yacare terminal',
    		pre: '>',
    		commands: [],
    		placeholder: '',
    		yacareClass: 'yacare-terminal',
    		template: '<form class="command-form"><div class="log"><div class="log-wrapper"></div></div><div class="command-line-wrapper"><span class="pre"></span><input type="text" class="command-line"></div></form>',
        }, options );

        var version = "<pre>\n\
=================================== \n\n\
 | | | |/ _` |/ __/ _` | '__/ _ /\n\
 | |_| | (_| | (_| (_| | | |  __/\n\
  \\__, |\\__,_|\\___\\__,_|_|  \\___|\n\
   __/ |                         \n\
  |___/    version 0.0.1\n\n\
===================================</pre>";

  		settings.greetings += version;
 
        var $element = this;
        var $form = setTemplate($element, settings);
        var $input = $element.find('.command-line');
        
        log = $element.find('.log').terminalLog();

        var initTerminal = function() {
        	log.push( settings.greetings );
        };

        var bindForm = function() {
        	// Bind the yacare form
        	$form.on( 'submit', onFormSubmit );
        };

        var onFormSubmit = function( event ) {
        	event.preventDefault();

        	var line = $input.val();
        	var firstWord = _.first(_.split( line, " "));

        	log.push( firstWord );
        	$input.val('');

        	if( !commandMatch( firstWord ) ) {
        		log.push( "Yacare: Command not found: " + firstWord ); 
        		return false;
        	}

        	var selectedCommand = commandList[ _.findIndex(commandList, function(o) { return o.name == firstWord }) ];

    		log.push( selectedCommand.phrase );
        	selectedCommand.exec();
        };

        var checkArguments = function() {
        	
        };

        var initCommands = function() {
        	commandList = _.union( commandList, settings.commands );

        	// _.forEach( commandList, function( command ) {
        	// 	log.push( command.name );
        	// });
        };

        var blockTerminal = function() {
        	$input.attr("disabled", "disabled");
        };

        var unblockTerminal = function() {
        	$input.attr("disabled", "false");
        };

        initTerminal();
        bindForm();
        initCommands();

        // settings.commands();

        return this;
 
    };
    
    function setTemplate($e, settings) {
    	$e
    		.addClass( settings.yacareClass )
    		.addClass( settings.style )
    		.append( settings.template )
    		.css( 'width', settings.width )
    		.find('input.command-line')
    			.attr( 'placeholder', settings.placeholder );
    	$e.find(".pre").text( settings.pre );
    	return $e.find('form');
    };

}( jQuery ));