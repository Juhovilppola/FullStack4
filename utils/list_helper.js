const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  var likes = blogs.reduce((sum, blog) => sum + blog.likes, 0)
  return likes
}

const favoriteBlog = (blogs) => {
  var blog = {}
  for (var i = 0; i < blogs.length; i++) {
    if (blog.title) {
      if (blog.likes < blogs[i].likes) {
        blog = {
          title: blogs[i].title,
          author: blogs[i].author,
          likes: blogs[i].likes
        }
      }
    } else {
      blog = {
        title: blogs[i].title,
        author: blogs[i].author,
        likes: blogs[i].likes
      }
    }

  }
  return blog
}

const mostBlogs = (blogs) => {
  var authors = blogs.map((blog) => { return blog.author })
  var i = 0
  var authorObjectList = []
  console.log(authors)
  while (i < authors.length) {
    console.log("obj", authorObjectList)
    var s = 0
    var check = false
    while (s < authorObjectList.length) {

      if (authorObjectList[s].author === authors[i]) {
        authorObjectList[s] = {
          author: authors[i],
          blogs: authorObjectList[s].blogs + 1
        }
        check = true
        break
      }

      s++
    }
    if (!check) {
      var obj = {
        author: authors[i],
        blogs: 1
      }
      authorObjectList.push(obj)
    }
    i++


  }
  var most = authorObjectList[0]
  console.log("most", most)
  for (var i = 0; i < authorObjectList.length - 1; i++) {
    console.log("most ", most.blogs, " au ", authorObjectList[i+1].blogs)
    if (most.blogs < authorObjectList[i + 1].blogs) {
      most = authorObjectList[i + 1]
    }
  }
  console.log("most2", most)
  return most

}

const mostLikes = (blogs) => {
  var i = 0
  var authorObjectList = []
  
  while (i < blogs.length) {
    console.log("obj", authorObjectList)
    var s = 0
    var check = false
    while (s < authorObjectList.length) {

      if (authorObjectList[s].author === blogs[i].author) {
        authorObjectList[s] = {
          author: blogs[i].author,
          likes: authorObjectList[s].likes + blogs[i].likes
        }
        check = true
        break
      }

      s++
    }
    if (!check) {
      var obj = {
        author: blogs[i].author,
        likes: blogs[i].likes
      }
      authorObjectList.push(obj)
    }
    i++


  }
  var most = authorObjectList[0]
  console.log("most", most)
  for (var i = 0; i < authorObjectList.length - 1; i++) {
    console.log("most ", most.likes, " au ", authorObjectList[i+1].likes)
    if (most.likes < authorObjectList[i + 1].likes) {
      most = authorObjectList[i + 1]
    }
  }
  console.log("most2", most)
  return most

}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}

