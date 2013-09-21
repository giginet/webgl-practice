class GLManager

  constructor: ($canvas) ->
    @gl = $canvas.get(0).getContext("webgl") or $canvas.get(0).getContext('experimental-webgl')
    @gl.clearColor(0, 0, 0, 1)
    @gl.clearDepth(1.0)
    @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT);

  createShader: (type, glsl) ->
    shader = @gl.createShader(type)
    @gl.shaderSource(shader, glsl)
    @gl.compileShader(shader)

    if @gl.getShaderParameter(shader, @gl.COMPILE_STATUS)
      return shader
    else
      alert(@gl.getShaderInfoLog(shader))

  createProgram: (vs, fs) ->
    program = @gl.createProgram()
    @gl.attachShader(program, vs)
    @gl.attachShader(program, fs)
    @gl.linkProgram(program)

    if @gl.getProgramParameter(program, @gl.LINK_STATUS)
      @gl.useProgram(program)
      return program
    else
      alert(@gl.getProgramInfoLog(program))

  createVBO: (data) ->
    vbo = @gl.createBuffer()
    @gl.bindBuffer(@gl.ARRAY_BUFFER, vbo)
    @gl.bufferData(@gl.ARRAY_BUFFER, new Float32Array(data), @gl.STATIC_DRAW)

    @gl.bindBuffer(@gl.ARRAY_BUFFER, null)

    vbo

$ ->
  fragment = 'src/glsl/main.frag'
  vertex = 'src/glsl/main.vert'

  $canvas = $("#canvas")
  $canvas.attr({width: 300, height: 300})
  $.when($.get(fragment), $.get(vertex))
    .done( (fragment, vertex) ->
      manager = new GLManager($canvas)
      gl = manager.gl
      vs = manager.createShader(gl.VERTEX_SHADER, vertex[0])
      fs = manager.createShader(gl.FRAGMENT_SHADER, fragment[0])

      program = manager.createProgram(vs, fs)
      attLocation = gl.getAttribLocation(program, 'position')

      attStride = 3

      vertexPosition = [0, 1, 0, 1, 0, 0, -1, 0, 0]

      vbo = manager.createVBO(vertexPosition)
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
      gl.enableVertexAttribArray(attLocation)
      gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0)

      mMat = mat4.identity(mat4.create())
      vMat = mat4.identity(mat4.create())
      pMat = mat4.identity(mat4.create())
      mvpMat = mat4.identity(mat4.create())

      mat4.lookAt(vMat, [0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0])
    
      mat4.perspective(pMat, 90, 300.0 / 300.0, 0.1, 100)
    
      mat4.multiply(mvpMat, pMat, vMat)
      mat4.multiply(mvpMat, mvpMat, mMat)
    
      uniLocation = gl.getUniformLocation(program, 'mvpMatrix')
    
      gl.uniformMatrix4fv(uniLocation, false, mvpMat)
    
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    
      gl.flush();
    )
