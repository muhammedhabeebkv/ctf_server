let express = require("express");
let router = express.Router();
let expressBouncer = require("express-bouncer");
let { Auth } = require("../auth/user-auth");
const manageUser = require("../config/manage-user");
const {checkAuthAdmin} = require('../auth/checkAuth')

// let bouncer = expressBouncer();

// bouncer.whitelist.push("127.0.0.1");
// bouncer.blocked = (request, response, next, remaining) => {};

/* ======================> User auth <====================== */
router.get("/login", (request, response) => {
  let resetPassword = request.query.reset?true:false
  let redirectURL = request.query.redirectURL

  if(redirectURL !== request.session.redirectURL){
    request.session.redirect = false
    request.session.redirectURL = null
  }

  let Error = {}
  if(request.session.Error){
    Error.Error = request.session.Error
    Error.ErrorMsg = request.session.ErrorMsg

    request.session.Error = false
    request.session.ErrorMsg = null
  }

  let Success = {}
  if(request.session.Success){
    Success.Success = request.session.Success
    Success.SuccessMsg = request.session.SuccessMsg

    request.session.Success = false
    request.session.SuccessMsg = null
  }

  if(request.session.user_login){
    request.session.redirect = false
    request.session.redirectURL = null
    response.status(301).redirect('/')
  }
  else{
    if(resetPassword && request.session.reset){
      let newDate =new Date().getTime()

      if(newDate > request.session.resetTimeOut){
        request.session.reset = false
        request.session.resetEmail = null
        request.session.Error = true
        request.session.ErrorMsg = "session timeout!"
        response.status(301).redirect('/login?reset=password')
      }
      else{
        response.status(200).render("users/reset-password",{
          title: '- Reset code sended',
          reset: true,
          resetEmail:request.session.resetEmail,
          Error
        })
      }
    }
    else if(resetPassword){
      request.session.resetTimeOut = new Date().getTime() + 300000 // 3 min
      response.status(200).render("users/reset-password",{
        title: '- Reset password',
        Error
      })
    }
    else{
      response.status(200).render("users/login", {
        title: "- login",
        Error
      });
    }
  }
  
});

router.post("/login", (request, response) => {
  Auth.doLogin(request.body)
    .then((data) => {
      const {username, email, dob, role, createAt } = data
      request.session.user_login = true;
      request.session.username = username;
      request.session.email = email;
      request.session.dob = dob;
      request.session.role = role;
      request.session.createAt = createAt;
      request.session.Success = true;
      request.session.SuccessMsg = "User logged."
      if(request.session.redirect){
        response.status(301).redirect(request.session.redirectURL)
      }
      else{
        response.status(301).redirect('/')
      }
    })
    .catch((Error) => {
      request.session.Error = true
      request.session.ErrorMsg = Error
      response.status(301).redirect('/login')
    });
});

router.post('/login/reset-password',(request, response) => {
  let email = request.body.email?request.body.email:null
  Auth.changePassword(email,false)
  .then(data => {
    request.session.reset = true
    request.session.resetEmail = email
    response.status(301).redirect('/login?reset=password')
  })
  .catch(err => {
    request.session.Error = true
    request.session.ErrorMsg = err
    response.status(301).redirect('/login?reset=password')
  })
})

router.get("/sign-up", (request, response) => {
  let Error = {
    Error: request.session.Error ? request.session.Error : false,
    ErrorMsg: request.session.ErrorMsg ? request.session.ErrorMsg : null,
  };

  request.session.Error = false;
  request.session.ErrorMsg = null;

  response.status(200).render("users/sign-up", {
    title: "- login",
    Error,
  });
});

router.post("/sign-up", (request, response) => {
  Auth.doSignUP(request.body)
    .then((data) => {
      request.session.Success = true
      request.session.SuccessMsg = data
      response.status(301).redirect('/login')
    })
    .catch((Error) => {
      request.session.Error = true;
      request.session.ErrorMsg = Error;
      response.status(301).redirect("/sign-up");
    });
});

/* ======================> Admin auth <====================== */
router.get("/admin/login", (request, response) => {
  if (request.session.admin_login) {
    response.status(301).redirect("/admin");
  } else {
    let Error = {
      Error: request.session.Error ? request.session.Error : false,
      ErrorMsg: request.session.ErrorMsg ? request.session.ErrorMsg : null,
    };

    request.session.Error = false;
    request.session.ErrorMsg = null;

    response.status(200).render("admin/sign-in", {
      title: "- Admin login",
      Error,
    });
  }
});

router.post("/admin/login", (request, response) => {
  Auth.doAdminLogin(request.body)
    .then((email) => {
      request.session.admin_login = true;
      request.session.admin_email = email;
      response.status(301).redirect("/admin");
    })
    .catch((Err) => {
      request.session.Error = true;
      request.session.ErrorMsg = Err;
      response.status(301).redirect("/admin/login");
    });
});

router.post("/admin/change-default-credential", (request, response) => {
  if (request.session.admin_login) {
    Auth.doChangeAdminDefault(request.body)
      .then((dataChange) => {})
      .catch((err) => {
        console.log(err);
      });
  } else {
    request.session.Error = true;
    request.session.ErrorMsg = "Permission Denied!";
    response.status(413).redirect("/admin/login");
  }
});

//==========================={ user management }
router.get("/admin/manage-user",checkAuthAdmin, (request, response) => {
  let query = request.query ? request.query.q || request.query.name || request.query.email || request.query.dob || null : null;
  

  manageUser.listUser((error, userInfo) => {
    if (error) {
      console.log(error);
    }

    response.status(200).render("admin/manage-user", {
      title: "- Manage user",
      admin: {
        login: true,
        email: request.session.admin_email ? request.session.admin_email : null,
      },
      userInfo: userInfo ? userInfo : null,
      query,
    });
  });
});

router.post("/admin/manage-user/change-role", (request, response) => {
  console.log(request.body);
});

router.get("/admin/manage-user/:id", (request, response) => {
  console.log(request.params.id);
});

router.get("/logout", (request, response) => {
  request.session.destroy();
  response.status(301).redirect("/");
});

module.exports = router;
