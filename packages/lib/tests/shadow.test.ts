/**
 * Shadow Calculation Module Tests
 * 
 * Tests for shadow offset, blur, opacity, and scale calculations.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateShadowOffset,
  calculateShadowBlur,
  calculateShadowOpacity,
  calculateShadowScale,
  createShadowCalculator,
  DEFAULT_SHADOW_OPTIONS,
} from '../src/core/shadow';
import type { Vec3 } from '../src/types';

describe('Shadow Calculation Module', () => {
  describe('calculateShadowOffset', () => {
    it('should return zero offset when light is directly above ball at same height', () => {
      const ballPos: Vec3 = { x: 0.5, y: 0.5, z: 1.0 };
      const lightPos: Vec3 = { x: 0.5, y: 0.5, z: 1.0 };
      
      const { offsetX, offsetY } = calculateShadowOffset(ballPos, lightPos);
      
      expect(offsetX).toBeCloseTo(0, 5);
      expect(offsetY).toBeCloseTo(0, 5);
    });
    
    it('should project shadow away from light when light is to the left', () => {
      const ballPos: Vec3 = { x: 0.5, y: 0.5, z: 0.5 };
      const lightPos: Vec3 = { x: 0.2, y: 0.5, z: 2.0 };
      
      const { offsetX, offsetY } = calculateShadowOffset(ballPos, lightPos);
      
      // Shadow should be to the right (positive X offset)
      expect(offsetX).toBeGreaterThan(0);
      // Y offset should be minimal since light is at same Y
      expect(Math.abs(offsetY)).toBeLessThan(0.1);
    });
    
    it('should project shadow away from light when light is above', () => {
      const ballPos: Vec3 = { x: 0.5, y: 0.5, z: 0.5 };
      const lightPos: Vec3 = { x: 0.5, y: 0.2, z: 2.0 };
      
      const { offsetX, offsetY } = calculateShadowOffset(ballPos, lightPos);
      
      // Shadow should be below (positive Y offset)
      expect(offsetY).toBeGreaterThan(0);
      // X offset should be minimal since light is at same X
      expect(Math.abs(offsetX)).toBeLessThan(0.1);
    });
    
    it('should increase offset magnitude with ball height', () => {
      const lightPos: Vec3 = { x: 0.3, y: 0.3, z: 2.0 };
      
      const ballLow: Vec3 = { x: 0.5, y: 0.5, z: 0.2 };
      const ballMid: Vec3 = { x: 0.5, y: 0.5, z: 0.5 };
      const ballHigh: Vec3 = { x: 0.5, y: 0.5, z: 0.8 };
      
      const offsetLow = calculateShadowOffset(ballLow, lightPos);
      const offsetMid = calculateShadowOffset(ballMid, lightPos);
      const offsetHigh = calculateShadowOffset(ballHigh, lightPos);
      
      const magLow = Math.sqrt(offsetLow.offsetX ** 2 + offsetLow.offsetY ** 2);
      const magMid = Math.sqrt(offsetMid.offsetX ** 2 + offsetMid.offsetY ** 2);
      const magHigh = Math.sqrt(offsetHigh.offsetX ** 2 + offsetHigh.offsetY ** 2);
      
      // Higher ball should have larger shadow offset
      expect(magMid).toBeGreaterThan(magLow);
      expect(magHigh).toBeGreaterThan(magMid);
    });
    
    it('should handle light at extreme positions', () => {
      const ballPos: Vec3 = { x: 0.5, y: 0.5, z: 0.5 };
      
      // Light at corner
      const lightCorner: Vec3 = { x: 0.0, y: 0.0, z: 2.0 };
      const offsetCorner = calculateShadowOffset(ballPos, lightCorner);
      
      // Shadow should point away from corner (positive X and Y)
      expect(offsetCorner.offsetX).toBeGreaterThan(0);
      expect(offsetCorner.offsetY).toBeGreaterThan(0);
    });
    
    it('should handle ball at ground level (Z=0)', () => {
      const ballPos: Vec3 = { x: 0.5, y: 0.5, z: 0.0 };
      const lightPos: Vec3 = { x: 0.3, y: 0.3, z: 2.0 };
      
      const { offsetX, offsetY } = calculateShadowOffset(ballPos, lightPos);
      
      // Shadow should still be calculated, but offset should be minimal
      expect(Math.abs(offsetX)).toBeLessThan(0.2);
      expect(Math.abs(offsetY)).toBeLessThan(0.2);
    });
  });
  
  describe('calculateShadowBlur', () => {
    it('should return minimal blur at ground level (Z=0)', () => {
      const blur = calculateShadowBlur(0, 0.5, 30);
      
      expect(blur).toBe(0);
    });
    
    it('should increase blur with height', () => {
      const baseRadius = 30;
      const softness = 0.5;
      
      const blur0 = calculateShadowBlur(0.0, softness, baseRadius);
      const blur25 = calculateShadowBlur(0.25, softness, baseRadius);
      const blur50 = calculateShadowBlur(0.5, softness, baseRadius);
      const blur75 = calculateShadowBlur(0.75, softness, baseRadius);
      const blur100 = calculateShadowBlur(1.0, softness, baseRadius);
      
      // Verify monotonic increase
      expect(blur25).toBeGreaterThan(blur0);
      expect(blur50).toBeGreaterThan(blur25);
      expect(blur75).toBeGreaterThan(blur50);
      expect(blur100).toBeGreaterThan(blur75);
    });
    
    it('should scale blur with softness parameter', () => {
      const z = 0.5;
      const baseRadius = 30;
      
      const blurSoft0 = calculateShadowBlur(z, 0.0, baseRadius);
      const blurSoft50 = calculateShadowBlur(z, 0.5, baseRadius);
      const blurSoft100 = calculateShadowBlur(z, 1.0, baseRadius);
      
      // Higher softness should produce more blur
      expect(blurSoft50).toBeGreaterThan(blurSoft0);
      expect(blurSoft100).toBeGreaterThan(blurSoft50);
    });
    
    it('should scale blur with base radius', () => {
      const z = 0.5;
      const softness = 0.5;
      
      const blurSmall = calculateShadowBlur(z, softness, 20);
      const blurMedium = calculateShadowBlur(z, softness, 30);
      const blurLarge = calculateShadowBlur(z, softness, 40);
      
      // Larger base radius should produce more blur
      expect(blurMedium).toBeGreaterThan(blurSmall);
      expect(blurLarge).toBeGreaterThan(blurMedium);
    });
    
    it('should never return negative blur', () => {
      const blur = calculateShadowBlur(0, 0, 30);
      
      expect(blur).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('calculateShadowOpacity', () => {
    it('should return maximum opacity at ground level (Z=0)', () => {
      const opacityAtGround = 0.4;
      const opacity = calculateShadowOpacity(0, opacityAtGround);
      
      expect(opacity).toBeCloseTo(opacityAtGround, 2);
    });
    
    it('should decrease opacity with height', () => {
      const opacityAtGround = 0.4;
      
      const opacity0 = calculateShadowOpacity(0.0, opacityAtGround);
      const opacity25 = calculateShadowOpacity(0.25, opacityAtGround);
      const opacity50 = calculateShadowOpacity(0.5, opacityAtGround);
      const opacity75 = calculateShadowOpacity(0.75, opacityAtGround);
      const opacity100 = calculateShadowOpacity(1.0, opacityAtGround);
      
      // Verify monotonic decrease
      expect(opacity25).toBeLessThan(opacity0);
      expect(opacity50).toBeLessThan(opacity25);
      expect(opacity75).toBeLessThan(opacity50);
      expect(opacity100).toBeLessThan(opacity75);
    });
    
    it('should scale with opacityAtGround parameter', () => {
      const z = 0.5;
      
      const opacity20 = calculateShadowOpacity(z, 0.2);
      const opacity40 = calculateShadowOpacity(z, 0.4);
      const opacity60 = calculateShadowOpacity(z, 0.6);
      
      // Higher opacityAtGround should produce higher opacity
      expect(opacity40).toBeGreaterThan(opacity20);
      expect(opacity60).toBeGreaterThan(opacity40);
    });
    
    it('should clamp opacity to [0,1] range', () => {
      const opacity = calculateShadowOpacity(0, 1.5); // Invalid input
      
      expect(opacity).toBeLessThanOrEqual(1);
      expect(opacity).toBeGreaterThanOrEqual(0);
    });
    
    it('should approach zero at maximum height', () => {
      const opacity = calculateShadowOpacity(1.0, 0.4);
      
      // Should be very small but not necessarily exactly zero
      expect(opacity).toBeLessThan(0.1);
    });
  });
  
  describe('calculateShadowScale', () => {
    it('should return 1.0 at ground level (Z=0)', () => {
      const scale = calculateShadowScale(0, 0.1);
      
      expect(scale).toBe(1.0);
    });
    
    it('should decrease scale with height', () => {
      const minScale = 0.1;
      
      const scale0 = calculateShadowScale(0.0, minScale);
      const scale25 = calculateShadowScale(0.25, minScale);
      const scale50 = calculateShadowScale(0.5, minScale);
      const scale75 = calculateShadowScale(0.75, minScale);
      const scale100 = calculateShadowScale(1.0, minScale);
      
      // Verify monotonic decrease
      expect(scale25).toBeLessThan(scale0);
      expect(scale50).toBeLessThan(scale25);
      expect(scale75).toBeLessThan(scale50);
      expect(scale100).toBeLessThan(scale75);
    });
    
    it('should clamp to minScale at maximum height', () => {
      const minScale = 0.2;
      const scale = calculateShadowScale(1.0, minScale);
      
      expect(scale).toBeCloseTo(minScale, 5);
    });
    
    it('should never go below minScale', () => {
      const minScale = 0.15;
      
      // Test various heights
      for (let z = 0; z <= 1; z += 0.1) {
        const scale = calculateShadowScale(z, minScale);
        expect(scale).toBeGreaterThanOrEqual(minScale);
      }
    });
    
    it('should respect different minScale values', () => {
      const z = 1.0;
      
      const scale10 = calculateShadowScale(z, 0.1);
      const scale30 = calculateShadowScale(z, 0.3);
      const scale50 = calculateShadowScale(z, 0.5);
      
      expect(scale10).toBeCloseTo(0.1, 5);
      expect(scale30).toBeCloseTo(0.3, 5);
      expect(scale50).toBeCloseTo(0.5, 5);
    });
  });
  
  describe('createShadowCalculator', () => {
    it('should create a calculator with default options', () => {
      const calculator = createShadowCalculator({}, 800, 600, 30);
      
      expect(calculator).toBeDefined();
      expect(calculator.compute).toBeInstanceOf(Function);
    });
    
    it('should compute shadow parameters correctly', () => {
      const calculator = createShadowCalculator(
        {
          softness: 0.5,
          opacityAtGround: 0.4,
          minScale: 0.1,
        },
        800,
        600,
        30
      );
      
      const ballPos: Vec3 = { x: 0.5, y: 0.5, z: 0.5 };
      const lightPos: Vec3 = { x: 0.3, y: 0.3, z: 2.0 };
      
      const shadow = calculator.compute(ballPos, lightPos);
      
      expect(shadow.offsetX).toBeDefined();
      expect(shadow.offsetY).toBeDefined();
      expect(shadow.blur).toBeGreaterThan(0);
      expect(shadow.opacity).toBeGreaterThan(0);
      expect(shadow.opacity).toBeLessThanOrEqual(1);
      expect(shadow.scale).toBeGreaterThan(0);
      expect(shadow.scale).toBeLessThanOrEqual(1);
    });
    
    it('should convert offset from normalized to pixel coordinates', () => {
      const canvasWidth = 800;
      const canvasHeight = 600;
      
      const calculator = createShadowCalculator({}, canvasWidth, canvasHeight, 30);
      
      const ballPos: Vec3 = { x: 0.5, y: 0.5, z: 0.5 };
      const lightPos: Vec3 = { x: 0.2, y: 0.5, z: 2.0 };
      
      const shadow = calculator.compute(ballPos, lightPos);
      
      // Offset should be in pixel coordinates
      // Since light is to the left, offsetX should be positive and scaled by canvas width
      expect(Math.abs(shadow.offsetX)).toBeGreaterThan(1); // Should be in pixels, not normalized
    });
    
    it('should produce consistent results for same inputs', () => {
      const calculator = createShadowCalculator(
        { softness: 0.7, opacityAtGround: 0.3, minScale: 0.2 },
        800,
        600,
        30
      );
      
      const ballPos: Vec3 = { x: 0.5, y: 0.5, z: 0.5 };
      const lightPos: Vec3 = { x: 0.75, y: 0.25, z: 2.0 };
      
      const shadow1 = calculator.compute(ballPos, lightPos);
      const shadow2 = calculator.compute(ballPos, lightPos);
      
      expect(shadow1.offsetX).toBeCloseTo(shadow2.offsetX, 5);
      expect(shadow1.offsetY).toBeCloseTo(shadow2.offsetY, 5);
      expect(shadow1.blur).toBeCloseTo(shadow2.blur, 5);
      expect(shadow1.opacity).toBeCloseTo(shadow2.opacity, 5);
      expect(shadow1.scale).toBeCloseTo(shadow2.scale, 5);
    });
    
    it('should handle ball at different heights consistently', () => {
      const calculator = createShadowCalculator({}, 800, 600, 30);
      const lightPos: Vec3 = { x: 0.5, y: 0.5, z: 2.0 };
      
      const shadowLow = calculator.compute({ x: 0.5, y: 0.5, z: 0.0 }, lightPos);
      const shadowMid = calculator.compute({ x: 0.5, y: 0.5, z: 0.5 }, lightPos);
      const shadowHigh = calculator.compute({ x: 0.5, y: 0.5, z: 1.0 }, lightPos);
      
      // Blur should increase with height
      expect(shadowMid.blur).toBeGreaterThan(shadowLow.blur);
      expect(shadowHigh.blur).toBeGreaterThan(shadowMid.blur);
      
      // Opacity should decrease with height
      expect(shadowMid.opacity).toBeLessThan(shadowLow.opacity);
      expect(shadowHigh.opacity).toBeLessThan(shadowMid.opacity);
      
      // Scale should decrease with height
      expect(shadowMid.scale).toBeLessThan(shadowLow.scale);
      expect(shadowHigh.scale).toBeLessThan(shadowMid.scale);
    });
  });
  
  describe('DEFAULT_SHADOW_OPTIONS', () => {
    it('should have valid default values', () => {
      expect(DEFAULT_SHADOW_OPTIONS.softness).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_SHADOW_OPTIONS.softness).toBeLessThanOrEqual(1);
      
      expect(DEFAULT_SHADOW_OPTIONS.opacityAtGround).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_SHADOW_OPTIONS.opacityAtGround).toBeLessThanOrEqual(1);
      
      expect(DEFAULT_SHADOW_OPTIONS.minScale).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_SHADOW_OPTIONS.minScale).toBeLessThanOrEqual(1);
    });
  });
});
