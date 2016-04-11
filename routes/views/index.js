var keystone = require('keystone');
var Expense = keystone.list('Expense');
var _ = require('underscore');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'home';
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.expenseSubmitted = false;

	// Get all expenses from database
	view.on('init', function(next) {

		Expense.model.find()
			.sort('-createdAt')
			.exec(function (err, expenses) {
				var total = 0;

				locals.expenses = expenses;
				_.each(expenses, function (expense) {
					total = total + expense.cost;
				});

				locals.totals = {
					all: total,
					individual: _.chain(expenses).groupBy('user').map(function (user, key) {
							return {
								user: key,
								total: _.reduce(user, function (m, x) {
									return Math.round((m + x.cost) * 100) / 100;
								}, 0)
							};
						}).value()
				};

				// Calculate individual share: total / number of users with expenses
				locals.totals.share = Math.round((locals.totals.all / locals.totals.individual.length) * 100) / 100;

				_.each(locals.totals.individual, function (individual) {
					individual.balance = individual.total - locals.totals.share;
				});

				next();
			});
	});

	// On POST requests, add the Expense item to the database
	view.on('post', { action: 'addExpense' }, function(next) {

		var newExpense = new Expense.model(),
			updater = newExpense.getUpdateHandler(req);

		updater.process(req.body, {
			flashErrors: true,
			fields: 'user, store, memo, cost',
			errorMessage: 'There was a problem submitting your expense:'
		}, function(err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				//locals.expenseSubmitted = true;
				locals.expenses.push({
					store: req.body.store,
					memo: req.body.memo,
					cost: req.body.cost,
					createdAt: 'Just Now'
				});

				req.body.store = '';
				req.body.memo = '';
				req.body.cost = '';
			}
			next();
			res.redirect('/');
		});

	});

	view.on('post', { action: 'removeExpense' }, function(next) {
		Expense.model.findById(req.body.removeId)
			.remove(function (err) {
				next();
				res.redirect('/');
			});
	});

	// Render the view
	view.render('index');

};
