// WebGL Soccer Game - Main Entry Point

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.gl = this.canvas.getContext('webgl2', { antialias: true });
        
        if (!this.gl) {
            alert('WebGL 2.0 not supported!');
            return;
        }
        
        this.renderer = new Renderer(this.gl);
        this.camera = new Camera();
        this.physics = new Physics();
        this.inputController = new InputController();
        
        this.match = null;
        this.isPaused = false;
        this.gameRunning = true;
        this.deltaTime = 0;
        this.lastTime = Date.now();
        
        this.setupEventListeners();
        this.initializeGame();
        this.gameLoop();
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.togglePause();
        });
        
        document.getElementById('resume-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('settings-btn').addEventListener('click', () => console.log('Settings'));
        document.getElementById('quit-btn').addEventListener('click', () => this.quitGame());
    }
    
    initializeGame() {
        // Initialize renderer
        this.gl.clearColor(0.1, 0.15, 0.25, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        
        // Create match
        this.match = new Match(this.physics);
        this.match.initialize();
        
        // Setup camera
        this.camera.position = [0, 15, 25];
        this.camera.lookAt([0, 5, 0]);
        this.camera.setAspect(this.canvas.width / this.canvas.height);
    }
    
    onWindowResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.camera.setAspect(this.canvas.width / this.canvas.height);
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pause-menu').classList.toggle('hidden');
    }
    
    quitGame() {
        this.gameRunning = false;
        location.reload();
    }
    
    update(deltaTime) {
        if (this.isPaused) return;
        
        // Update input
        this.inputController.update();
        
        // Update match
        this.match.update(deltaTime, this.inputController);
        
        // Update physics
        this.physics.step(deltaTime);
        
        // Update camera
        this.camera.followBall(this.match.ball);
        
        // Update UI
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('home-score').textContent = this.match.homeTeam.score;
        document.getElementById('away-score').textContent = this.match.awayTeam.score;
        document.getElementById('time-display').textContent = this.match.getTimeString();
        document.getElementById('possession-value').textContent = 
            Math.round(this.match.getPossession()) + '%';
    }
    
    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        
        // Render pitch
        this.renderer.renderPitch();
        
        // Render ball
        this.renderer.renderBall(this.match.ball);
        
        // Render players
        this.renderer.renderTeam(this.match.homeTeam, [1, 0, 0]);
        this.renderer.renderTeam(this.match.awayTeam, [0, 1, 1]);
        
        // Render debug info
        if (this.inputController.debugMode) {
            this.renderer.renderDebugInfo(this.match);
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        const currentTime = Date.now();
        this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.016);
        this.lastTime = currentTime;
        
        this.update(this.deltaTime);
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    const game = new GameEngine();
    window.game = game; // For debugging
});