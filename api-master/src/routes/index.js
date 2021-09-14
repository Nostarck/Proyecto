import user from './userRoute.js';
import student from './studentRoute.js';
import group from './groupRoute.js';
import tag from './tagRoute.js'
import problem from './problemRoute.js'

// Index file as a middleware for route calls
export default {
  user,
  student,
  group,
  tag,
  problem
};