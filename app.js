const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const ejs = require("ejs");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const db  = mysql.createConnection({
  host: "localhost",
  user: "rishi",
  password: "",
  database: "dbms",
  port: "3306"
});

var userid = 0;

db.connect((err)=>{
  if(err){
    console.log(err.message);
  }
  console.log('db' + db.state);
});

app.get("/",(req,res)=>{
  res.render("login.ejs");
});

app.post("/",(req,res)=>{
  let sql = 'SELECT * FROM users';
  let u =[];
  let p =[];
  let l =0;
  let query = db.query(sql,(err,results)=>{
    if(err) throw err;
    for(let i=0;i<results.length;i++)
    {
      u.push(results[i].UserName);
      p.push(results[i].password);
    }

    for(let i=0;i<u.length;i++)
    {
        if(req.body.username === u[i])
        {
          for(let j=0;j<p.length;j++)
          {
            if(req.body.password === p[j])
              {
                userid = results[j].UserID;
                console.log(userid);
                l = 1;
                res.redirect("/index");
              }
          }
        }
    }
    if(l == 0)
    res.redirect("/");

  });
});




app.get("/newuser",(req,res)=>{
    res.render("newuser.ejs");
});

app.post("/newuser",(req,res)=>{
  let p = {Username: req.body.username,
          UserMail: req.body.email,
          password: req.body.password};

  let sql = 'INSERT INTO users SET ?';

  let query = db.query(sql,p,(err,result)=>{
  if(err) throw err;
  //console.log(result);
  res.redirect("index");
  });
});

app.get("/delete/:delid",(req,res)=>{
    let del_id = req.params.delid;
    console.log(del_id);
    let sql = `DELETE FROM posts WHERE postid = '${del_id}' and UserID='${userid}'`;
    let query = db.query(sql,(err,results)=>{
      if(err) throw err;
      console.log();
      res.redirect("/index");
    })
});

app.get("/index",(req,res)=>{
  let sql = `SELECT * FROM posts WHERE UserID='${userid}'`;
  let query = db.query(sql,(err,results)=>{
    if(err) throw err;
    //console.log(results);

    res.render("index.ejs",{p: results,uid:userid});
  });

});

app.get("/post/:pid",(req,res)=>{
  const requiredid = req.params.pid;
  let sql = `SELECT * FROM posts WHERE postid = '${requiredid}'`;
  let query = db.query(sql,(err,result)=>{
    if(err) throw err;
    res.render("post.ejs",{ptitle: result[0].postTitle,pid: result[0].postid, psub: result[0].postSubtitle, pbody: result[0].postBody});
    console.log(result[0].postTitle);
  });
  });

app.get("/contact",(req,res)=>{
  res.render("contact.ejs");
});

app.get("/about",(req,res)=>{
  res.render("about.ejs");
});

app.get("/compose",(req,res)=>{
  res.render("compose.ejs");
});

app.post("/compose",(req,res)=>{
  let p = {UserID:userid,
          postTitle: req.body.pt,
          postSubtitle: req.body.ps,
          postBody: req.body.pb};

  let sql = 'INSERT INTO posts SET ?';

  let query = db.query(sql,p,(err,result)=>{
  if(err) throw err;
  //console.log(result);
  res.redirect("/index");
  });
});


app.get("/profile",(req,res)=>{
  let sql = `SELECT * FROM users WHERE UserID ='${userid}'`;
  let query = db.query(sql,(err,result)=>{
      if(err) throw err;
        console.log(result);
      res.render("profile.ejs",{r: result[0]});
  });
});

app.post("/profile",(req,res)=>{
  let sql = `UPDATE users SET password ='${req.body.newp}' WHERE UserID = '${userid}' `;
  let query = db.query(sql,(err,result)=>{
    if(err) throw err;
    console.log(result);
    res.redirect("/profile");
  })
})





app.listen(3000, function() {
  console.log("Server started on port 3000");
});
