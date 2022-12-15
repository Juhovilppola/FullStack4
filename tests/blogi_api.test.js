/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const User = require('../models/user')

const Blog = require('../models/blog')
const { request } = require('../app')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.testBlogs)
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('salainensana', 10)
  const user = new User({ username: 'testi', passwordHash })

  await user.save()
})
describe('get tests', () => {
  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.testBlogs.length)
  })
  test('returned blogs have id defined', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
  })
})

describe('post tests', () => {
  test('blog cant be added without token', async () => {
    const newBlog = {
      title: 'Best Blog',
      author: 'Seppo Sepotiainen',
      url: 'BestBlogIsBestBlog.fi',
      likes: 1337,
    }


    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)


    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.testBlogs.length)

    const titles = blogsAtEnd.map(n => n.title)
    expect(titles).not.toContain(
      'Best Blog'
    )
  })

  test('blog can be added with token', async () => {
    const newBlog = {
      title: 'Best Blog',
      author: 'Seppo Sepotiainen',
      url: 'BestBlogIsBestBlog.fi',
      likes: 1337,
    }
    const logUser = {
      username: 'testi',
      password: 'salainensana'
    }
    const result = await api
      .post('/api/login')
      .send(logUser)
      .expect(200)
    const obj = JSON.parse(result.res.text)
    console.log(obj.token)

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${obj.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)


    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.testBlogs.length + 1)

    const titles = blogsAtEnd.map(n => n.title)
    expect(titles).toContain(
      'Best Blog'
    )
    const user = await helper.usersInDb()
    expect(user[0].blogs.length).toBe(1)
  })

  test('blog can´t be added with wrong token', async () => {
    const newBlog = {
      title: 'Best Blog',
      author: 'Seppo Sepotiainen',
      url: 'BestBlogIsBestBlog.fi',
      likes: 1337,
    }
    const logUser = {
      username: 'testi',
      password: 'salainensana'
    }
    const result = await api
      .post('/api/login')
      .send(logUser)
      .expect(200)
    const obj = JSON.parse(result.res.text)
    console.log(obj.token)

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${obj.token}5`)
      .send(newBlog)
      .expect(401)


    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.testBlogs.length)

    const titles = blogsAtEnd.map(n => n.title)
  })

  test('if posted blog likes have no value it is set to 0 ', async () => {
    const newBlog = {
      title: 'Best Blog',
      author: 'Seppo Sepotiainen',
      url: 'BestBlogIsBestBlog.fi',
    }
    const logUser = {
      username: 'testi',
      password: 'salainensana'
    }
    const result = await api
      .post('/api/login')
      .send(logUser)
      .expect(200)
    const obj = JSON.parse(result.res.text)

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${obj.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)


    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.testBlogs.length + 1)

    const blog = blogsAtEnd.find(blog => blog.title === 'Best Blog')
    expect(blog.likes).toBe(0)
  })

  test('posted blog doesn´t have url or title response is "400 Bad Request"', async () => {
    const titless = {
      author: 'Seppo Sepotiainen',
      url: 'BestBlogIsBestBlog.fi',
      likes: 3
    }
    const urless = {
      title: 'Best Blog',
      author: 'Seppo Sepotiainen',
      likes: 3
    }
    const urlessTitless = {
      author: 'Seppo Sepotiainen',
      likes: 3
    }



    const logUser = {
      username: 'testi',
      password: 'salainensana'
    }
    const result = await api
      .post('/api/login')
      .send(logUser)
      .expect(200)
    const obj = JSON.parse(result.res.text)

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${obj.token}`)
      .send(titless)
      .expect(400)

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${obj.token}`)
      .send(urless)
      .expect(400)

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${obj.token}`)
      .send(urlessTitless)
      .expect(400)


    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.testBlogs.length)

  })
})
describe('delete tests', () => {
  test('deleting blog without token returns 401', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.testBlogs.length)



  })


  test('blog can be deleted with token', async () => {
    const newBlog = {
      title: 'Best Blog',
      author: 'Seppo Sepotiainen',
      url: 'BestBlogIsBestBlog.fi',
      likes: 1337,
    }
    const logUser = {
      username: 'testi',
      password: 'salainensana'
    }
    const result = await api
      .post('/api/login')
      .send(logUser)
      .expect(200)
    const obj = JSON.parse(result.res.text)
    console.log(obj.token)

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${obj.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)




    const blogsAtmiddle = await helper.blogsInDb()
    blogToDelete = blogsAtmiddle.find(blog => blog.title === 'Best Blog')
    console.log(blogToDelete)

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `bearer ${obj.token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    const titles = blogsAtEnd.map(n => n.title)
    expect(titles).not.toContain(
      'Best Blog'
    )
  })
})

describe('modifying tests', () => {
  test('modifying likes of blogs is succesful', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToModify = blogsAtStart[0]

    const blog = {
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 1337,
    }

    await api
      .put(`/api/blogs/${blogToModify.id}`)
      .send(blog)
      .expect(200)



    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.testBlogs.length)
    const found = blogsAtEnd.find(blog => blog.title === blogToModify.title)

    expect(found.likes).toBe(blog.likes)
  })
})

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('salainensana', 10)
    const user = new User({ username: 'testi', passwordHash })

    await user.save()
  })
  test('creation succeeds with new username', async () => {
    const userAtStart = await helper.usersInDb()

    const newUser = {
      username: 'newUser',
      name: 'Seppo Seiväs',
      password: 'pass'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(userAtStart.length + 1)
    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
  test('creation fails if username is taken', async() => {
    const userAtStart = await helper.usersInDb()

    const newUser = {
      username: 'testi',
      name: 'Seppo Seiväs',
      password: 'pass'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body.error).toContain('username must be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(userAtStart.length)
    const names = usersAtEnd.map(u => u.name)
    expect(names).not.toContain(newUser.name)

  })

  test('creation fails if username is too short', async() => {
    const userAtStart = await helper.usersInDb()

    const newUser = {
      username: 'te',
      name: 'Seppo Seiväs',
      password: 'pass'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body.error).toContain('User validation failed')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(userAtStart.length)
    const names = usersAtEnd.map(u => u.name)
    expect(names).not.toContain(newUser.name)

  })

  test('creation fails if password is too short', async() => {
    const userAtStart = await helper.usersInDb()

    const newUser = {
      username: 'testeri',
      name: 'Seppo Seiväs',
      password: 'pa'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body.error).toContain('password is required and must be at least 3 characters')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(userAtStart.length)
    const names = usersAtEnd.map(u => u.name)
    expect(names).not.toContain(newUser.name)

  })

})


afterAll(() => {
  mongoose.connection.close()
})