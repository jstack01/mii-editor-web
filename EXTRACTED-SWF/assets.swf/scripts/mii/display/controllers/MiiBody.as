package mii.display.controllers
{
   import flash.display.MovieClip;
   import flash.geom.ColorTransform;
   import flash.geom.Point;
   import flash.geom.Rectangle;
   import mii.*;
   import mii.display.*;
   import mii.values.*;
   
   public class MiiBody
   {
      
      private var heightToWeightRange:Range = new Range(0.6,1);
      
      private var lowerArmToUpperArmPt:Point = new Point(50,0);
      
      private var heightRange:Range = new Range(0.4,1);
      
      private const MAX_SIZE:int = 127;
      
      private var scaleRatioW:Number;
      
      private var bodyToNeckPt:Point = new Point(0,-75);
      
      private var upperArmToTorsoPt:Point = new Point(20,-64);
      
      private var weightRange:Range = new Range(0.45,1);
      
      private var favoriteColor:ColorTransform = new ColorTransform(0.28,0.22,0.22,1,110,10,10,0);
      
      private var footToLegPt:Point = new Point(-2,95);
      
      private var specialColor:ColorTransform = new ColorTransform(0.5,0.5,0.4,1,190,155,30,0);
      
      public var pants:MovieClip;
      
      private var legToTorsoPt:Point = new Point(20,3);
      
      private var foreignColor:ColorTransform = new ColorTransform(0.4,0.42,0.48,1,50,60,120,0);
      
      private var handToLowerArmPt:Point = new Point(48,-1);
      
      public var owner:MiiCharacterGraphics;
      
      private var scaleRatioH:Number;
      
      public var shirt:MovieClip;
      
      private var normalColor:ColorTransform = new ColorTransform(0.4,0.41,0.44,1,40,42,50,0);
      
      public function MiiBody(param1:MiiCharacterGraphics)
      {
         super();
         this.owner = param1;
         this.shirt = param1.body.shirt;
         this.pants = param1.body.pants;
      }
      
      public function updateColors() : void
      {
         var pantsColor:ColorTransform = null;
         var miiID:Number = NaN;
         shirt.transform.colorTransform = owner.getColor("favoriteColor");
         try
         {
            miiID = Number(owner.character.getValue("id")[0]);
            if(!isNaN(miiID))
            {
               if(miiID >= 192 && miiID <= 223)
               {
                  pantsColor = foreignColor;
               }
               else if(miiID <= 31 || miiID >= 64 && miiID <= 95)
               {
                  pantsColor = specialColor;
               }
               else
               {
                  pantsColor = normalColor;
               }
               pants.transform.colorTransform = pantsColor;
            }
         }
         catch(error:Error)
         {
            trace(error);
         }
      }
      
      public function updateSize() : void
      {
         scaleParts();
         positionParts();
      }
      
      private function positionParts() : void
      {
         var _loc1_:Point = null;
         var _loc2_:Number = NaN;
         var _loc3_:Rectangle = null;
         _loc1_ = shirt.globalToLocal(shirt.torso.localToGlobal(upperArmToTorsoPt));
         shirt.upperarm_left.x = -_loc1_.x;
         shirt.upperarm_right.x = _loc1_.x;
         shirt.upperarm_left.y = _loc1_.y;
         shirt.upperarm_right.y = _loc1_.y;
         _loc1_ = shirt.globalToLocal(shirt.upperarm_right.localToGlobal(lowerArmToUpperArmPt));
         shirt.lowerarm_left.x = -_loc1_.x;
         shirt.lowerarm_right.x = _loc1_.x;
         shirt.lowerarm_left.y = _loc1_.y;
         shirt.lowerarm_right.y = _loc1_.y;
         _loc1_ = shirt.globalToLocal(shirt.lowerarm_right.localToGlobal(handToLowerArmPt));
         shirt.hand_left.x = -_loc1_.x;
         shirt.hand_right.x = _loc1_.x;
         shirt.hand_left.y = _loc1_.y;
         shirt.hand_right.y = _loc1_.y;
         _loc2_ = owner.getFrame("gender");
         shirt.torso.gotoAndStop(_loc2_);
         _loc1_ = pants.globalToLocal(pants.torso.localToGlobal(legToTorsoPt));
         pants.leg_left.x = -_loc1_.x;
         pants.leg_right.x = _loc1_.x;
         pants.leg_left.y = _loc1_.y;
         pants.leg_right.y = _loc1_.y;
         _loc1_ = pants.globalToLocal(pants.leg_right.localToGlobal(footToLegPt));
         pants.foot_left.x = -_loc1_.x;
         pants.foot_right.x = _loc1_.x;
         pants.foot_left.y = _loc1_.y;
         pants.foot_right.y = _loc1_.y;
         _loc3_ = pants.getBounds(owner.body);
         owner.body.shadow.y = _loc3_.bottom;
         _loc1_ = owner.globalToLocal(shirt.torso.localToGlobal(bodyToNeckPt));
         owner.body.y -= _loc1_.y - owner.baseNeckY;
      }
      
      private function scaleParts() : void
      {
         var _loc1_:Number = NaN;
         _loc1_ = owner.character.getValue("height") / MAX_SIZE;
         scaleRatioH = heightRange.valueAt(_loc1_);
         scaleRatioW = weightRange.valueAt(owner.character.getValue("weight") / MAX_SIZE) * heightToWeightRange.valueAt(_loc1_);
         shirt.torso.scaleX = scaleRatioW;
         shirt.torso.scaleY = scaleRatioH;
         shirt.lowerarm_left.scaleX = scaleRatioH;
         shirt.lowerarm_left.scaleY = scaleRatioW;
         shirt.lowerarm_right.scaleX = scaleRatioH;
         shirt.lowerarm_right.scaleY = scaleRatioW;
         shirt.upperarm_left.scaleX = scaleRatioH;
         shirt.upperarm_left.scaleY = scaleRatioW;
         shirt.upperarm_right.scaleX = scaleRatioH;
         shirt.upperarm_right.scaleY = scaleRatioW;
         shirt.hand_left.scaleX = scaleRatioW;
         shirt.hand_left.scaleY = scaleRatioW;
         shirt.hand_right.scaleX = scaleRatioW;
         shirt.hand_right.scaleY = scaleRatioW;
         pants.torso.scaleX = scaleRatioW;
         pants.torso.scaleY = scaleRatioH;
         pants.leg_left.scaleX = scaleRatioW;
         pants.leg_left.scaleY = scaleRatioH;
         pants.leg_right.scaleX = scaleRatioW;
         pants.leg_right.scaleY = scaleRatioH;
         pants.foot_left.scaleX = scaleRatioW;
         pants.foot_left.scaleY = scaleRatioW;
         pants.foot_right.scaleX = scaleRatioW;
         pants.foot_right.scaleY = scaleRatioW;
      }
   }
}

