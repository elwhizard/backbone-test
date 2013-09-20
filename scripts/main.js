
(function ($, BB, _) {

	$('#add_contact').tooltip();

	var App = Backbone.View.extend({
		el: "#contacts",
		events: {
			'click #add_contact': 'addPerson'			

		},
		initialize: function () {
			this.input_name = $('#inputs input[name=fullname]');
			this.input_number = $('#inputs input[name=number]');
			this.input_username = $('#inputs input[name=username]');
			this.contacts_list = $('.table tbody');
			
			this.listenTo(this.collection, 'add', this.addOne);
			this.listenTo(this.collection, 'reset', this.addAll);
			this.listenTo(this.collection, 'all', this.render);

			this.collection.fetch();
		},
		render: function () {

		}, 
	    addAll: function() {
	      this.collection.each(this.addOne, this);
	    },
	    addOne: function(person) {

			person.set("position", this.collection.lastIndexOf(person) + 1);

			var view = new PersonView({model: person});

			this.contacts_list.append(view.render().el);
	    },
		addPerson: function (evt) {

			var personData = {
				name: this.input_name.val().trim(),
				number: this.input_number.val().trim(),
				username: this.input_username.val().trim()
			}

			if (!this.collection.checkData(personData)) return;

			var person = new PersonModel({
				name: this.input_name.val(),
				number: this.input_number.val(),
				username: this.input_username.val()
			});

			this.input_name.val('');
			this.input_number.val('');
			this.input_username.val('');

			this.collection.create(person);

		}
	});

	var PersonModel = Backbone.Model.extend({
		defaults: {
			'name': '-',
			'number': '-',
			'username': '-'
		},
		idAttribute: '_id',
		initialize: function () {

		}, 
		url: function () {
			var location = 'http://localhost:9090/contacts';
			return location + (this.get('_id') ? '/' + this.get('_id') : '');			
		}, 
		validate: function (attrs) {
			
		}, 
		comparator: 'position'
	});

	var PersonCollection = Backbone.Collection.extend({
		model: PersonModel,
		url: 'http://localhost:9090/contacts', 
		checkData: function (personData, id) {
			if (_.contains(personData, '')) {
				alert('Error: Fields cannot be empty.');
				return;
			}

			var findContact = this.findWhere({username: personData.username});

			if (findContact) {
				if (id !== findContact.get('_id')) {
					alert('Error: Username already exists.');
					return;	
				}
			}
			return true;
		},
		updatePosition: function () {
			if (!this.length) return;
			var i = 0;
			_.each(this.models, function (model) {
				model.set({position: i += 1})
			});
		}
	});

	var PersonView = Backbone.View.extend({
		tagName: 'tr',
		template: $('#contact_template').html(),
		editTemplate: $('#edit_mode_template').html(),
		events:  {
			'click .edit'	: 'editContact',				
			'click .delete'	: 'deleteContact',
			'click .cancel'	: 'editContact',
			'click .done'	: 'close'
		},
		initialize: function() {
			this.listenTo(this.model, 'change', this.render);
      		this.listenTo(this.model, 'destroy', this.remove);      		
		},
		render: function() {
			var compiledTemplate = _.template(this.template);			
			
			this.$el.addClass('contact')
			this.$el.html(compiledTemplate(this.model.toJSON()))

			this.input_name = this.$('input[name=fullname]')
			this.input_number = this.$('input[name=number]')
			this.input_username = this.$('input[name=username]')

			return this;
		}, 
		editContact: function () {
			this.$el.toggleClass('editing');
			this.input_name.focus();
		},
		close: function () {

			var personData = {
				name: this.input_name.val().trim(),
				number: this.input_number.val().trim(),
				username: this.input_username.val().trim()
			}

			if (!contactApp.collection.checkData(personData, this.model.get('_id'))) return;

			this.model.save(personData);
        	this.$el.removeClass("editing");
		},
		deleteContact: function () {
			this.model.destroy();
			contactApp.collection.updatePosition();
		}
	});

	var contactApp = new App({collection: new PersonCollection()});



})(jQuery, Backbone, _)