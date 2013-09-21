(function() {
  var GLManager;

  GLManager = (function() {
    function GLManager($canvas) {
      this.gl = $canvas.get(0).getContext("webgl") || $canvas.get(0).getContext('experimental-webgl');
      this.gl.clearColor(0, 0, 0, 1);
      this.gl.clearDepth(1.0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    GLManager.prototype.createShader = function(type, glsl) {
      var shader;
      shader = this.gl.createShader(type);
      this.gl.shaderSource(shader, glsl);
      this.gl.compileShader(shader);
      if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        return shader;
      } else {
        return alert(this.gl.getShaderInfoLog(shader));
      }
    };

    GLManager.prototype.createProgram = function(vs, fs) {
      var program;
      program = this.gl.createProgram();
      this.gl.attachShader(program, vs);
      this.gl.attachShader(program, fs);
      this.gl.linkProgram(program);
      if (this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        this.gl.useProgram(program);
        return program;
      } else {
        return alert(this.gl.getProgramInfoLog(program));
      }
    };

    GLManager.prototype.createVBO = function(data) {
      var vbo;
      vbo = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
      return vbo;
    };

    return GLManager;

  })();

  $(function() {
    var $canvas, fragment, vertex;
    fragment = 'src/glsl/main.frag';
    vertex = 'src/glsl/main.vert';
    $canvas = $("#canvas");
    $canvas.attr({
      width: 300,
      height: 300
    });
    return $.when($.get(fragment), $.get(vertex)).done(function(fragment, vertex) {
      var attLocation, attStride, fs, gl, mMat, manager, mvpMat, pMat, program, uniLocation, vMat, vbo, vertexPosition, vs;
      manager = new GLManager($canvas);
      gl = manager.gl;
      vs = manager.createShader(gl.VERTEX_SHADER, vertex[0]);
      fs = manager.createShader(gl.FRAGMENT_SHADER, fragment[0]);
      program = manager.createProgram(vs, fs);
      attLocation = gl.getAttribLocation(program, 'position');
      attStride = 3;
      vertexPosition = [0, 1, 0, 1, 0, 0, -1, 0, 0];
      vbo = manager.createVBO(vertexPosition);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(attLocation);
      gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);
      mMat = mat4.identity(mat4.create());
      vMat = mat4.identity(mat4.create());
      pMat = mat4.identity(mat4.create());
      mvpMat = mat4.identity(mat4.create());
      mat4.lookAt(vMat, [0.0, 1.0, 3.0], [0, 0, 0], [0, 1, 0]);
      mat4.perspective(pMat, 90, 300.0 / 300.0, 0.1, 100);
      mat4.multiply(mvpMat, pMat, vMat);
      mat4.multiply(mvpMat, mvpMat, mMat);
      uniLocation = gl.getUniformLocation(program, 'mvpMatrix');
      gl.uniformMatrix4fv(uniLocation, false, mvpMat);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return gl.flush();
    });
  });

}).call(this);
