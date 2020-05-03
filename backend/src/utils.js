function extractIdToken(req){
  if (!req || !req.headers || !req.headers.authorization) {
    return null;
  }
  const authSplit = req.headers.authorization.split(" ");
  if (authSplit[0] !== "Bearer") {
    return null;
  }
  return authSplit[1];
};

module.exports = {
  extractIdToken
}