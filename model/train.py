#!/usr/bin/env python3
"""
YOLOv8 Training Script for Sperm Detection
تدريب نموذج YOLOv8 لكشف الحيوانات المنوية
"""

import os
import argparse
import yaml
from pathlib import Path
from ultralytics import YOLO
import torch
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def train_sperm_detector(
    data_config='data.yaml',
    model='yolov8n.pt',
    epochs=100,
    imgsz=640,
    batch=16,
    project='runs/train',
    name='sperm_detector',
    resume=False,
    device='',
    workers=8,
    patience=50,
    save_period=10
):
    """
    Train YOLOv8 model for sperm detection
    
    Args:
        data_config: Path to data configuration file
        model: Model architecture or path to pretrained weights
        epochs: Number of training epochs
        imgsz: Image size for training
        batch: Batch size
        project: Project directory
        name: Experiment name
        resume: Resume training from last checkpoint
        device: Training device ('' for auto, 'cpu', '0', '1', etc.)
        workers: Number of dataloader workers
        patience: Early stopping patience
        save_period: Save checkpoint every N epochs
    """
    
    try:
        # Initialize model
        logger.info(f"Loading model: {model}")
        yolo_model = YOLO(model)
        
        # Check if CUDA is available
        device_info = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
        logger.info(f"Training device: {device_info}")
        
        # Train the model
        logger.info("Starting training...")
        results = yolo_model.train(
            data=data_config,
            epochs=epochs,
            imgsz=imgsz,
            batch=batch,
            project=project,
            name=name,
            resume=resume,
            device=device,
            workers=workers,
            patience=patience,
            save_period=save_period,
            verbose=True,
            # Optimization settings
            optimizer='AdamW',
            lr0=0.01,
            lrf=0.01,
            momentum=0.937,
            weight_decay=0.0005,
            warmup_epochs=3.0,
            warmup_momentum=0.8,
            warmup_bias_lr=0.1,
            # Augmentation settings
            hsv_h=0.015,
            hsv_s=0.7,
            hsv_v=0.4,
            degrees=0.0,
            translate=0.1,
            scale=0.5,
            shear=0.0,
            perspective=0.0,
            flipud=0.0,
            fliplr=0.5,
            mosaic=1.0,
            mixup=0.0,
            copy_paste=0.0,
        )
        
        logger.info("Training completed successfully!")
        logger.info(f"Results saved to: {results.save_dir}")
        
        return results
        
    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        raise

def create_data_config(train_path, val_path, test_path=None, nc=1, names=['sperm']):
    """
    Create data configuration file for YOLO training
    
    Args:
        train_path: Path to training images
        val_path: Path to validation images
        test_path: Path to test images (optional)
        nc: Number of classes
        names: List of class names
    """
    
    config = {
        'path': str(Path.cwd()),
        'train': train_path,
        'val': val_path,
        'nc': nc,
        'names': names
    }
    
    if test_path:
        config['test'] = test_path
    
    with open('data.yaml', 'w') as f:
        yaml.dump(config, f, default_flow_style=False)
    
    logger.info("Data configuration created: data.yaml")

def validate_dataset(data_config):
    """
    Validate dataset structure and annotations
    
    Args:
        data_config: Path to data configuration file
    """
    
    try:
        with open(data_config, 'r') as f:
            config = yaml.safe_load(f)
        
        # Check required fields
        required_fields = ['train', 'val', 'nc', 'names']
        for field in required_fields:
            if field not in config:
                raise ValueError(f"Missing required field in data config: {field}")
        
        # Check paths exist
        for split in ['train', 'val']:
            if split in config:
                path = Path(config[split])
                if not path.exists():
                    raise FileNotFoundError(f"{split} path does not exist: {path}")
                
                # Check for images and labels
                images_path = path / 'images' if (path / 'images').exists() else path
                labels_path = path / 'labels' if (path / 'labels').exists() else path.parent / 'labels' / path.name
                
                if not images_path.exists():
                    raise FileNotFoundError(f"Images path does not exist: {images_path}")
                
                if not labels_path.exists():
                    logger.warning(f"Labels path does not exist: {labels_path}")
                
                # Count files
                image_files = list(images_path.glob('*.jpg')) + list(images_path.glob('*.png'))
                label_files = list(labels_path.glob('*.txt')) if labels_path.exists() else []
                
                logger.info(f"{split}: {len(image_files)} images, {len(label_files)} labels")
        
        logger.info("Dataset validation passed!")
        return True
        
    except Exception as e:
        logger.error(f"Dataset validation failed: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Train YOLOv8 for sperm detection")
    parser.add_argument('--data', type=str, default='data.yaml', help='Dataset config file')
    parser.add_argument('--weights', type=str, default='yolov8n.pt', help='Model weights')
    parser.add_argument('--epochs', type=int, default=100, help='Number of epochs')
    parser.add_argument('--batch', type=int, default=16, help='Batch size')
    parser.add_argument('--imgsz', type=int, default=640, help='Image size')
    parser.add_argument('--device', type=str, default='', help='Training device')
    parser.add_argument('--project', type=str, default='runs/train', help='Project directory')
    parser.add_argument('--name', type=str, default='sperm_detector', help='Experiment name')
    parser.add_argument('--resume', action='store_true', help='Resume training')
    parser.add_argument('--workers', type=int, default=8, help='Dataloader workers')
    parser.add_argument('--patience', type=int, default=50, help='Early stopping patience')
    parser.add_argument('--save-period', type=int, default=10, help='Save period')
    parser.add_argument('--validate-only', action='store_true', help='Only validate dataset')
    
    args = parser.parse_args()
    
    # Validate dataset
    if not validate_dataset(args.data):
        logger.error("Dataset validation failed. Please fix the issues and try again.")
        return
    
    if args.validate_only:
        logger.info("Dataset validation completed. Use --train to start training.")
        return
    
    # Start training
    try:
        results = train_sperm_detector(
            data_config=args.data,
            model=args.weights,
            epochs=args.epochs,
            imgsz=args.imgsz,
            batch=args.batch,
            project=args.project,
            name=args.name,
            resume=args.resume,
            device=args.device,
            workers=args.workers,
            patience=args.patience,
            save_period=args.save_period
        )
        
        logger.info("Training script completed successfully!")
        
    except KeyboardInterrupt:
        logger.info("Training interrupted by user")
    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        raise

if __name__ == "__main__":
    main()