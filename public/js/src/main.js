var Route = require('./utils/route-matcher');
var router = new Route();

router.get('/', require('./viewmodel/index'));
