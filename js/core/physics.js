// Physics simulation

class Physics {
    constructor() {
        this.gravity = new Vec3(0, -9.81, 0);
        this.dragCoefficient = 0.99;
        this.bodies = [];
        this.pitchWidth = 105;
        this.pitchHeight = 68;
        this.collisions = [];
    }
    
    addBody(body) {
        this.bodies.push(body);
    }
    
    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) this.bodies.splice(index, 1);
    }
    
    step(deltaTime) {
        // Apply forces
        this.bodies.forEach(body => {
            if (body.isStatic) return;
            
            // Apply gravity
            body.acceleration = this.gravity.clone();
            
            // Apply damping
            body.velocity = body.velocity.multiply(this.dragCoefficient);
            
            // Update velocity
            body.velocity = body.velocity.add(body.acceleration.multiply(deltaTime));
            
            // Update position
            body.position = body.position.add(body.velocity.multiply(deltaTime));
            
            // Ground collision
            if (body.position.y < body.radius) {
                body.position.y = body.radius;
                body.velocity.y *= -0.7; // Bounce
            }
            
            // Pitch boundaries
            if (body.position.x < -this.pitchWidth / 2) body.position.x = -this.pitchWidth / 2;
            if (body.position.x > this.pitchWidth / 2) body.position.x = this.pitchWidth / 2;
            if (body.position.z < -this.pitchHeight / 2) body.position.z = -this.pitchHeight / 2;
            if (body.position.z > this.pitchHeight / 2) body.position.z = this.pitchHeight / 2;
        });
        
        // Collision detection and response
        this.checkCollisions();
    }
    
    checkCollisions() {
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const a = this.bodies[i];
                const b = this.bodies[j];
                
                const distance = a.position.distance(b.position);
                const minDistance = a.radius + b.radius;
                
                if (distance < minDistance) {
                    this.resolveCollision(a, b, distance, minDistance);
                }
            }
        }
    }
    
    resolveCollision(a, b, distance, minDistance) {
        const overlap = minDistance - distance;
        const direction = b.position.subtract(a.position).normalize();
        const correction = direction.multiply(overlap / 2);
        
        if (!a.isStatic) a.position = a.position.subtract(correction);
        if (!b.isStatic) b.position = b.position.add(correction);
        
        // Bounce
        const relativeVelocity = b.velocity.subtract(a.velocity);
        const velocityAlongNormal = relativeVelocity.dot(direction);
        
        if (velocityAlongNormal < 0) return;
        
        const restitution = 0.8;
        const impulse = direction.multiply(-(1 + restitution) * velocityAlongNormal / 2);
        
        if (!a.isStatic) a.velocity = a.velocity.subtract(impulse);
        if (!b.isStatic) b.velocity = b.velocity.add(impulse);
    }
}

class PhysicsBody {
    constructor(position, velocity, radius, mass) {
        this.position = position || new Vec3();
        this.velocity = velocity || new Vec3();
        this.acceleration = new Vec3();
        this.radius = radius || 0.5;
        this.mass = mass || 1;
        this.isStatic = false;
    }
    
    applyForce(force) {
        this.acceleration = this.acceleration.add(force.multiply(1 / this.mass));
    }
    
    applyImpulse(impulse) {
        this.velocity = this.velocity.add(impulse.multiply(1 / this.mass));
    }
}