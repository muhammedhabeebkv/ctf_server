let express = require("express");
const path = require("path");
let router = express.Router();

router.use((request, response, next) => {
  if (request.session.admin_login) {
    next();
  } else {
    request.session.typeName = 'Forbidden!'
    request.session.statuscode = 403
    response.status(403).sendFile(path.join(__dirname, "../views/error/access-denied.html"));
  }
});

router.get("/", (request, response) => {   
  let admin = {
    login: true,
    email: request.session.admin_email?request.session.admin_email:null
  }

  response.status(200).render('admin/index',{
    title: '- Admin',
    admin
  })
});

//==========================={ setings }
router.get('/settings', (request, response) => {
  response.status(200).render('admin/settings', {
    title: '- Settings',
    admin: {
      login: true,
      email: request.session.admin_email?request.session.admin_email:null
    }
  })
})

router.get('*', (request, response) => {
  let admin = {
    login: true,
    email: request.session.admin_email?request.session.admin_email:null
  }

  response.status(404).render('error/page-not-found',{
    title: '- Admin',
    admin
  })
})


module.exports = router;
