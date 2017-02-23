// yacare.js

(function ( $ ) {

	$.fn.terminalLog = function( options ) {
		var settings = $.extend({
			style: 'top'
		}, options);

		var $element = this;
    var $wrapper = $element.children(".log-wrapper");
    var $form = $element.parents("form");
    var $inputWrapper = $form.find('.command-line-wrapper');
    var $input =  $inputWrapper.find('.command-line');
    var $pre = $inputWrapper.find('.pre');
		$element.addClass('ignited');

    var busy = false;

		return {
      isBusy: function() {
        return this.busy;
      },
      setBusy: function( state ) {
        return this.busy = state;
      },
			push: function( text, style ) {
        style = style == undefined ? style = '' : style;
				$wrapper.append("<div class='"+style+"'>" + text + "</div>");
	      $element.scrollTop($wrapper.height());
			},
			clean: function() {
				$wrapper.html('');
			},
      block: function() {
        $input.attr('disabled', 'disabled').addClass('disabled');
        $inputWrapper.addClass('disabled');
      },
      unblock: function() {
        $input.removeAttr('disabled').removeClass('disabled');
        $inputWrapper.removeClass('disabled');
      },
      cleanInput: function() {
        $input.val('');
      },
      prompt: function( question ) {
        var self = this;
        self.push( "> " + question );
        self.busy = true;
        console.log(self.busy);

        var p = new Promise(function(resolve, reject) {

          $form.on('submit', function(e) {
            self.busy = false;
            resolve($input.val());
            self.cleanInput();
          });
        });

        return p;
      },
		};
	};

  $.fn.yacare = function( options ) {

    var log;

    var $element = this;

    var cleanLog = function(log,s, a) {
    return log.clean();
    };

  	var printVersion = function(log,s,a) {
  		log.push( version );
  	};

  	var retrievePrograms = function() {
  		return _.map(defaultPrograms, 'name');
  	};

    var defaultPrograms = {
      'ya': {
        name: 'ya',
        phrase: 'Yacare main program, type "ya usage" for help',
        commands: {
          '': function( log, self, arguments ) {
            var arguments = arguments[0];
            var output = (arguments == undefined || arguments =="") ? self.phrase : arguments;
            if(output == 'hello') {
              this.yatalk( log, self, 'hi there' );
            } else {
              log.push(output);
            }
            return output;
          },
          'yatalk': function( log, self, arguments ) {
            log.push("<i class='ya'></i>" + arguments, 'ya');
            return arguments;
          },
          'version': function( log, self, arguments ) {
            return log.push(self.version);
          },
            'kill': function( log, self, arguments ) {
                log.block();
                return this.yatalk( log, self, "bye bye");
            },
            'bg': function( log, self, arguments ) {
                $element.css('background-color', arguments);
            },
            'color': function( log, self, arguments ) {
                $element.css('color', arguments);
            },
            "?": function( log, self, arguments ) {
                log.prompt("are you ok? y/n").then(function(response) {
                    log.push(response);
                    if (response == "y") log.push("cool");
                    else log.push("stay strong");
                });
            }
                },
                delay: 0,
                usage: "Usage:<br>\
                        ya &lt;command&gt; &lt;arguments&gt;<br>\
                        <br>\
                        Commands:<br>\
                        version -&gt; gives you the version of ya<br>\
                        kill -&gt; kills the yacare terminal<br>\
                        bg -&gt; changes the bg color: 'ya bg \"#f00\"'<br>\
                        color -&gt; changes the font color: 'ya color \"#f00\"'<br>\
                        yatalk -&gt; you can talk like YA: 'ya yatalk \"hello world!\"'<br>",
                version: '0.0.1',
                author: 'jeronimonunez'
            },
            'list': {
                name: 'list',
                phrase: "List available programs",
                commands: {
                    '': function(log,self, arguments) {
                        return log.push( retrievePrograms() );
                    }
                },
                delay: 0,
                usage: 'just type "list"',
                author: 'jeronimonunez'
            },
            'alert': {
                name: 'alert',
                phrase: "Check the alert",
                commands: {
                    '': function(log,self, arguments){
                        if (arguments[0] == undefined || arguments.length > 1)
                            return log.push("This command takes 1 argument", "error");
                        alert( arguments[0] );
                    }
                },
                delay: 0,
                usage: "Usage <br> alert 'your message'",
                author: 'jeronimonunez'
    		},
    		'clean': {
    			name: 'clean',
    			phrase: "Clean the log please",
                commands: { '': cleanLog },
    			delay: 0,
                usage: "type 'clean' to clean the log",
                author: 'jeronimonunez'
            },
            'version': {
                name: 'version',
                commands: {'':printVersion},
                phrase: "Print the version please",
                delay: 0,
                usage: "type 'print'",
    			author: 'jeronimonunez'
    		},
            '?': {
                name: '?',
                commands: {
                    '': function(log, self, args) {
                        args = _.join(_.split(args, " "),"+");
                        $.ajax({
                            type: "POST",
                            dataType: 'jsonp',
                            url: 'http://api.duckduckgo.com/?q='+args+'&format=json&pretty=1&t=yacare',
                            success: function(response) {
                                var abstract = response.Abstract;
                                if(abstract!=='') log.push(abstract,'ya');
                                else log.push("No data available");
                            }
                        })
                    }
                }
            }
        };

        var usageProgram = {
            'usage': function( self ) {
                log.push( self.usage );
            }
        }

    	var commandMatch = function( command ) {
    		// console.log( retrievePrograms(), command );
    		// console.log(_.indexOf( retrievePrograms(), command ));
    		return _.indexOf( retrievePrograms(), command ) >= 0;
    	};

        var settings = $.extend({
            style: 'static',
        		backgroundColor: '#000',
        		width: '400px',
        		greetings: 'Welcome to yacare terminal',
        		pre: '$',
        		placeholder: '',
        		yacareClass: '',
        		template: '<form class="command-form"><div class="log"><div class="log-wrapper"></div></div><div class="command-line-wrapper"><span class="pre"></span><input type="text" class="command-line"></div></form><div class="logo"></div><div class="scanline"></div>',
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

        defaultPrograms = $.extend( defaultPrograms, settings.programs );

        var $form = setTemplate($element, settings);
        var $input = $element.find('.command-line');

        log = $element.find('.log').terminalLog();

        var initTerminal = function() {
        	log.push( settings.greetings );
        };

        var bindForm = function() {
        	// Bind the yacare form
        	$form.on( 'submit', onCommandEntered );
            $input.on('keyup', function(e) {
                if(e.keyCode == 38) {
                    var lastCommand = localStorage.getItem('lastEnteredCommand');
                    if (lastCommand) $input.val(lastCommand);
                }
                if(e.keyCode == 40) {
                    $input.val('');
                }
            });
        };

        var onCommandEntered = function( event ) {
        	event.preventDefault();

            console.log(log.isBusy());
            if( log.isBusy() ) return false;

        	var line = $input.val();
            var enteredCommand = _.first(_.split( line, " "));

            // localStorage
            localStorage.setItem('lastEnteredCommand', line);

            log.push( line );
            $input.val('');

            if( !commandMatch( enteredCommand ) ) {
                log.push( "Yacare: Command not found: " + enteredCommand, "error" );
                return false;
            }

            var program = defaultPrograms[ enteredCommand ],
                com = '',
                arguments = [];

            var argumentsOrCommands = line.substring( _.indexOf(line," "));

            console.log(argumentsOrCommands);

            if(_.split( line, " " ).length == 1) {
                com = '';
            } else if( isArgument( argumentsOrCommands ) ){
                com = '';
                arguments = convertArgumentsToArray( argumentsOrCommands );
            } else {
                // is command
                var wordsArray = _.words( argumentsOrCommands, /[^, ]+/g );
                com = _.first(wordsArray);
                arguments = wordsArray.length > 1 ? convertArgumentsToArray( _.trim( argumentsOrCommands ).substring(com.length) ) : '';
            }

            arguments = _.flatten(arguments);

            if (com == 'usage') { log.push(program.usage); return false; }

            if ( typeof program.commands[com] == 'function' ) {
                return program.commands[com]( log, program, arguments );
            } else {
                log.push("that argument or command isn't valid","error");
                return false;
            }

        };

        var convertArgumentsToArray = function( str ) {
            var str = str;
            var r;
            var finalArray = [];
            console.log(str);
            do {
                r = retrieveStringOrWord(str);
                console.log(r);
                finalArray.push( _.first(r) );
                str = _.last(r);
            } while(str!=='' && str!=='"' && str!=="'");
            return finalArray;
        };

        var isArgumentVoid = function( arg ) {
            var argsString = _.trim( arg );
            // console.log( "is void?", argsString );
            return argsString === "";
        };

        var isArgument = function( arg ) {
            var argsString = _.trim( arg );
            return _.startsWith( argsString, '"' ) || _.startsWith( argsString, "'" ) || !isNaN(_.first(_.words(argsString)));
        };

        var retrieveStringOrWord = function( str ) {
            var argsString = _.trim( str );
            var firstArg;
            console.log(str);
            console.log(argsString);
            if(_.startsWith( argsString, "'" )) {
                firstArg = _.split(argsString,"'")[1];
                return [firstArg, argsString.substr(firstArg.length) ];
            } else if(_.startsWith( argsString, '"' )) {
                firstArg = _.split(argsString, '"')[1];
                return [firstArg, argsString.substr(firstArg.length+1) ];
            } else {
                firstArg = _.first(_.words(argsString));
                return [firstArg, argsString.substr(firstArg.length+1) ];
            }
        };

        var makeArray = function( str ) {

        	return commands;
        };

        var initCommands = function() {
        	defaultPrograms = $.extend( defaultPrograms, settings.commands );

        	// _.forEach( defaultPrograms, function( command ) {
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
    		.addClass( 'yacare-terminal ' + settings.yacareClass )
    		.addClass( settings.style )
    		.append( settings.template )
    		.css( 'width', settings.width )
    		.find('input.command-line')
    			.attr( 'placeholder', settings.placeholder );
    	$e.find(".pre").text( settings.pre );
    	return $e.find('form');
    };

}( jQuery ));
