from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)

# SQLite database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///cute.db'
db = SQLAlchemy(app)

# Database Model for Blog Posts
class Cutepost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    subtitle = db.Column(db.String(100))
    author = db.Column(db.String(50))
    date_posted = db.Column(db.DateTime, default=datetime.utcnow)
    content = db.Column(db.Text)
    cover = db.Column(db.String(255))

# Home Page - Display All Posts
@app.route('/')
def index():
    posts = Cutepost.query.order_by(Cutepost.date_posted.desc()).all()
    return render_template('index.html',
                           posts=posts,
                           title='Cute Blog 🥳',
                           description='A simple modern blog using Flask and SQLAlchemy.',
                           cover='https://www.python.org/static/opengraph-icon-200x200.png')

# Blog List Page
@app.route('/cutelist')
def cutelist():
    posts = Cutepost.query.order_by(Cutepost.date_posted.desc()).all()
    return render_template('cutelist.html',
                           posts=posts,
                           title='Cute List Blog 🥳',
                           description='A simple modern blog using Flask and SQLAlchemy.',
                           cover='https://www.python.org/static/opengraph-icon-200x200.png')

# Single Post Page
@app.route('/post/<int:post_id>')
def post(post_id):
    post = Cutepost.query.get_or_404(post_id)
    return render_template('post.html', post=post)

# Delete Post
@app.route('/delete/<int:post_id>')
def delete(post_id):
    post = Cutepost.query.get_or_404(post_id)
    try:
        db.session.delete(post)
        db.session.commit()
        return redirect(url_for('cutelist'))
    except:
        return "Error deleting post."

# Update Post
@app.route('/update/<int:post_id>', methods=['GET', 'POST'])
def update(post_id):
    post = Cutepost.query.get_or_404(post_id)
    if request.method == 'POST':
        post.title = request.form['title']
        post.subtitle = request.form['subtitle']
        post.author = request.form['author']
        post.content = request.form['content']
        post.cover = request.form['cover']
        try:
            db.session.commit()
            return redirect(url_for('cutelist'))
        except:
            return "Error updating post."
    return render_template('update.html', post=post)

# Add New Post Form
@app.route('/cute')
def add():
    return render_template('cute.html')

# Submit New Post
@app.route('/cutepost', methods=['POST'])
def cutepost():
    new_post = Cutepost(
        title=request.form['title'],
        subtitle=request.form['subtitle'],
        author=request.form['author'],
        content=request.form['content'],
        cover=request.form['cover']
    )
    try:
        db.session.add(new_post)
        db.session.commit()
        return redirect(url_for('cutelist'))
    except:
        return "Error adding post."

# Run the App
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=True)
