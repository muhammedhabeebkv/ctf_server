let express = require("express");
let router = express.Router();
let {checkAuth} = require('../auth/checkAuth')

router.get("/", (request, response) => {
  let user = {}
  let Success = {}
  let Error = {}
  if(request.session.user_login){
    user.login = request.session.user_login;
    user.username = request.session.username;
    user.email = request.session.email;
    user.dob = request.session.dob;
    user.role = request.session.role;
    user.createAt = request.session.createAt
  }

  if(request.session.Success){
    Success.Success = request.session.Success
    Success.SuccessMsg = request.session.SuccessMsg

    request.session.Success = false
    request.session.SuccessMsg = null
  }

  if(request.session.Error){
    Error.Error = request.session.Error
    Error.ErrorMsg = request.session.ErrorMsg

    request.session.Error = false
    request.session.ErrorMsg = null
  }

  response.status(200).render('users/index',{
    user,
    Success,
    Error
  })
});

router.get("/machines", checkAuth, (request, response) => {
  let user = {}
  let Success = {}
  let Error = {}
  if(request.session.user_login){
    user.login = request.session.user_login;
    user.username = request.session.username;
    user.email = request.session.email;
    user.dob = request.session.dob;
    user.role = request.session.role;
    user.createAt = request.session.createAt
  }

  if(request.session.Success){
    Success.Success = request.session.Success
    Success.SuccessMsg = request.session.SuccessMsg
    
    request.session.Success = false
    request.session.SuccessMsg = null
  }

  if(request.session.Error){
    Error.Error = request.session.Error
    Error.ErrorMsg = request.session.ErrorMsg

    request.session.Error = false
    request.session.ErrorMsg = null
  }

  response.status(200).render('users/machine',{
    title: '- Machines',
    user,
    Success,
    Error
  })
})

router.get("/rooms", checkAuth, (request, response) => {
  let user = {}
  let Success = {}
  let Error = {}
  if(request.session.user_login){
    user.login = request.session.user_login;
    user.username = request.session.username;
    user.email = request.session.email;
    user.dob = request.session.dob;
    user.role = request.session.role;
    user.createAt = request.session.createAt
  }

  if(request.session.Success){
    Success.Success = request.session.Success
    Success.SuccessMsg = request.session.SuccessMsg
    
    request.session.Success = false
    request.session.SuccessMsg = null
  }

  if(request.session.Error){
    Error.Error = request.session.Error
    Error.ErrorMsg = request.session.ErrorMsg

    request.session.Error = false
    request.session.ErrorMsg = null
  }

  response.status(200).render("users/rooms", {
    title: '- Rooms',
    user,
    Error,
    Success
  })
})

module.exports = router;
