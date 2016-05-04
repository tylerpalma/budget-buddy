var Vue = require('vue');
var _ = require('lodash');
var moment = require('moment');

Vue.use(require('vue-resource'));
Vue.config.debug = true;

var baseUrl = 'http://localhost:3001/';

if (window.BUDGETBUDDY && window.BUDGETBUDDY.data) var userId = window.BUDGETBUDDY.data.userId;

module.exports = function() {

  var ExpenseTable = new Vue({
    el: '#expense-table',
    data: {
      expenses: [],
      user: {}
    },
    methods: {
      deleteExpense: function(expenseId) {
        var c = confirm("Are you sure you want to delete this expense item?");
        if (c === true) {
          this.$http.delete(baseUrl + 'api/expenses/' + expenseId);
          this.expenses = this.expenses.filter(function(item) {
            if (item._id == expenseId) {
              return false;
            } else {
              return true;
            }
          });
        }
      }
    },
    directives: {
      time: {
        update: function (value) {
          this.el.innerHTML = moment(value).format('MMM Do h:mm a');
        }
      }
    },
    init: function() {
      this.$http.get(baseUrl + 'api/expenses', function(data, status, request) {
        if(status == 200) {
          this.expenses = data.expenses;
        }
      });

      this.$http.get(baseUrl + 'api/users/' + userId, function(data, status, request) {
        if(status == 200) {
          this.user = data.user;
        }
      });
    },
    ready: function() {

    }
  });

}
