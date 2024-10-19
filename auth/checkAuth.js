let path = require('path')

module.exports.checkAuth = (request, response, next) => {
  if (request.session.user_login) {
    next();
  } else {
    request.session.Error = true;
    request.session.ErrorMsg = "Please login then use!";
    request.session.redirect = true;
    request.session.redirectURL = request.originalUrl;
    response.status(413).redirect("/login?redirectURL=" + request.originalUrl);
  }
};

module.exports.checkAuthAdmin = (request, response, next) => {
  if (request.session.admin_login) {
    next();
  } else {
    request.session.typeName = "Forbidden!";
    request.session.statuscode = 403;
    response.status(403).sendFile(path.join(__dirname, "../views/error/access-denied.html"));
  }
};