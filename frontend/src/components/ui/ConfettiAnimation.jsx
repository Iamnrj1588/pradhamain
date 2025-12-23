import React, { useEffect, useState } from 'react';

const ConfettiAnimation = ({ show, onComplete }) => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (show) {
            const newParticles = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                x: Math.random() * window.innerWidth,
                y: -10,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3 + 2,
                color: ['#8B1538', '#DAA520', '#FF6B6B', '#4ECDC4', '#45B7D1'][Math.floor(Math.random() * 5)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            }));
            setParticles(newParticles);

            const timer = setTimeout(() => {
                setParticles([]);
                onComplete?.();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [show, onComplete]);

    useEffect(() => {
        if (particles.length === 0) return;

        const interval = setInterval(() => {
            setParticles(prev => prev.map(particle => ({
                ...particle,
                x: particle.x + particle.vx,
                y: particle.y + particle.vy,
                vy: particle.vy + 0.1,
                rotation: particle.rotation + particle.rotationSpeed
            })).filter(particle => particle.y < window.innerHeight + 20));
        }, 16);

        return () => clearInterval(interval);
    }, [particles]);

    if (!show || particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute"
                    style={{
                        left: particle.x,
                        top: particle.y,
                        width: particle.size,
                        height: particle.size,
                        backgroundColor: particle.color,
                        transform: `rotate(${particle.rotation}deg)`,
                        borderRadius: '2px'
                    }}
                />
            ))}
        </div>
    );
};

export default ConfettiAnimation;