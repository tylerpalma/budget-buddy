var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Expense Model
 * =============
 */

var Expense = new keystone.List('Expense');

Expense.add({
  user: { type: Types.Text, initial: false },
	store: { type: Types.Text, required: true, initial: false },
	memo: { type: Types.Text, required: true, initial: false },
	cost: { type: Types.Money, format: '$0,0.00', currency: 'en-gb', required: true, initial: false },
	createdAt: { type: Date, default: Date.now }
});

Expense.schema.pre('save', function(next) {
	this.wasNew = this.isNew;
	next();
});

Expense.schema.post('save', function() {
	if (this.wasNew) {
		//this.sendNotificationEmail();
	}
});

Expense.schema.methods.sendNotificationEmail = function(callback) {

	if ('function' !== typeof callback) {
		callback = function() {};
	}

	var expense = this;

	keystone.list('User').model.find().where('isAdmin', true).exec(function(err, admins) {

		if (err) return callback(err);

		new keystone.Email('enquiry-notification').send({
			to: admins,
			from: {
				name: 'Budget Buddy',
				email: 'contact@budget-buddy.com'
			},
			subject: 'New Expense for Budget Buddy',
			enquiry: expense
		}, callback);

	});

};

Expense.defaultSort = '-createdAt';
Expense.defaultColumns = 'name, store, memo, cost, createdAt';
Expense.register();
