let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();

/* ---- TESTING MY ROUTES WITH MOCHA, MOCHA-HTTP, CHAI, CHAI-HTTP ---- */

chai.use(chaiHttp);

/* --- TESTING MY ROUTE TO GET ALL THE CAMPS --- */
describe('/GET camps', () => {
  it('Expecting to get all my camps from the database and receive status code 200, and the outcome should be an array', (done) => {
    chai
      .request(app)
      .get('/api/camps')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        done();
      });
  });
});

/* --- TESTING MY ROUTE TO GET ONE SINGLE CAMP --- */
describe('/GET camps/:campId', () => {
  it('Expecting to get one single camp from the database and receive status code 200, and the outcome should be an array, and information about the camp such as price, belt level, place, etc.', (done) => {
    chai
      .request(app)
      .get('/api/camp/636d44cdcaa7d30082a84fbc')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('description');
        done();
      });
  });
});

/* --- TESTING MY ROUTE FOR ADMIN LOGIN --- */

adminAuth = {
  email: 'hej@gmail.com',
  password: 'hej123456',
};
describe('/POST /signin', () => {
  it('Expecting to receive status code 200 for successful login and user object.', (done) => {
    chai
      .request(app)
      .post('/api/signin')
      .send(adminAuth)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('user');
        done();
      });
  });
});
