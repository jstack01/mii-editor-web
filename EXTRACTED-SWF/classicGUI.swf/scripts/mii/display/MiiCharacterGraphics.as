package mii.display
{
   import flash.display.BlendMode;
   import flash.display.MovieClip;
   import flash.geom.ColorTransform;
   import flash.geom.Point;
   import flash.system.Security;
   import flash.text.TextField;
   import mii.*;
   import mii.display.controllers.*;
   import mii.values.*;
   
   public class MiiCharacterGraphics extends MovieClip
   {
      
      private static const origin:Point = new Point(0,0);
      
      private static const HEAD_TYPE_COUNT:int = 8;
      
      private static const SHADED_GLASSES_FRAME:int = 7;
      
      private static const faceShapeOffsets:Array = [0,-3,14,6,3,-3,13,16];
      
      private static const ranges:Object = {
         "eyeX":new Range(0,54),
         "eyeY":new Range(-69,35),
         "eyeSize":new Range(0.26,1),
         "eyeRotation":new Range(-81.5,0),
         "eyebrowX":new Range(0,52.5),
         "eyebrowY":new Range(-59,25),
         "eyebrowSize":new Range(0.25,1),
         "eyebrowRotation":new Range(-125,0),
         "noseY":new Range(-10,70),
         "noseSize":new Range(0.2,1),
         "mouthY":new Range(-11,89),
         "mouthSize":new Range(0.218,1),
         "glassesY":new Range(-47,49),
         "glassesSize":new Range(0.4,1.46),
         "mustacheY":new Range(0,86),
         "mustacheSize":new Range(0.25,1),
         "moleX":new Range(-71,71),
         "moleY":new Range(-60,100),
         "moleSize":new Range(0.4,1.25)
      };
      
      public static const skinColors:Array = [new ColorTransform(0.88,0.85,0.8,1,235,205,187,0),new ColorTransform(-0.02,0.23,0.39,1,248,187,124,0),new ColorTransform(0.13,0.42,0.44,1,214,134,71,0),new ColorTransform(-0.02,0.28,0.38,1,246,174,136,0),new ColorTransform(0.42,0.44,0.45,1,142,73,31,0),new ColorTransform(0.44,0.44,0.43,1,72,38,13,0)];
      
      public static const hairColors:Array = [new ColorTransform(0.43,0.43,0.42,1,15,14,12,0),new ColorTransform(0.44,0.44,0.45,1,46,25,6,0),new ColorTransform(0.4,0.4,0.39,1,82,37,14,0),new ColorTransform(0.43,0.43,0.43,1,102,56,22,0),new ColorTransform(0.43,0.43,0.43,1,105,106,108,0),new ColorTransform(0.43,0.42,0.42,1,61,44,14,0),new ColorTransform(0.44,0.44,0.44,1,113,82,25,0),new ColorTransform(0.24,0.37,0.42,1,185,149,87,0)];
      
      public static const eyebrowColors:Array = hairColors;
      
      public static const facialHairColors:Array = hairColors;
      
      public static const eyeColors:Array = [new ColorTransform(0,0,0,1,0,0,0,0),new ColorTransform(0.09,0.11,0.1,1,109,123,124,0),new ColorTransform(0.22,0.24,0.25,1,108,80,65,0),new ColorTransform(0.13,0.14,0.22,1,122,122,40,0),new ColorTransform(0.17,0.17,0.25,1,24,60,184,0),new ColorTransform(0.16,0.15,0.11,1,48,140,79,0)];
      
      public static const mouthColors:Array = [new ColorTransform(0.7,0.6,0.55,1,180,69,35,0),new ColorTransform(1,0.45,0.3,1,220,51,40,0),new ColorTransform(1,0.6,0.6,1,197,84,86,0)];
      
      public static const glassesColors:Array = [new ColorTransform(0.17,0.18,0.18,1,76,85,84,0),new ColorTransform(0.28,0.31,0.37,1,105,81,21,0),new ColorTransform(0.09,0.37,0.41,1,163,43,16,0),new ColorTransform(0.37,0.31,0.19,1,23,69,128,0),new ColorTransform(0.15,0.19,0.29,1,169,107,8,0),new ColorTransform(0.21,0.22,0.24,1,171,172,164,0)];
      
      public static const favoriteColors:Array = [new ColorTransform(0.9911,0.47,0.51,1,191,38,2,0),new ColorTransform(0.05,0.37,0.44,1,240,128,42,0),new ColorTransform(0.32,0.47,0.55,1,235,190,27,0),new ColorTransform(0.53,0.52,0.53,1,131,167,19,0),new ColorTransform(0.58,0.47,0.47,1,1,82,28,0),new ColorTransform(0.42,0.43,0.22,1,5,41,151,0),new ColorTransform(0.51,0.42,0.36,1,78,142,199,0),new ColorTransform(0.35,0.5,0.5,1,241,96,96,0),new ColorTransform(0.38,0.48,0.32,1,93,30,153,0),new ColorTransform(0.4,0.42,0.42,1,82,53,22,0),new ColorTransform(0.45,0.45,0.45,1,190,190,190,0),new ColorTransform(0.8,0.8,0.8,1,5,5,5,0)];
      
      public var version:String = "0.0.0.0";
      
      public const nativeHeight:int = 600;
      
      public var versionText:TextField;
      
      public var baseHeadY:Number = 140;
      
      private var currHeadOffset:Number = 0;
      
      public var baseNeckY:Number = 220;
      
      public var baseBodyY:Number = 350;
      
      public var baseY:Number = 130;
      
      public var body:MovieClip;
      
      private var _character:MiiCharacterData;
      
      public var headback:MovieClip;
      
      public var head:MovieClip;
      
      private var bodyController:MiiBody;
      
      public const nativeWidth:int = 300;
      
      public function MiiCharacterGraphics()
      {
         super();
         Security.allowDomain("*");
         bodyController = new MiiBody(this);
         if(versionText)
         {
            version = versionText.text;
            removeChild(versionText);
         }
      }
      
      public function get character() : MiiCharacterData
      {
         return _character;
      }
      
      public function getRangeValue(param1:String) : Number
      {
         var _loc2_:MiiDataValue = null;
         var _loc3_:Range = null;
         _loc2_ = _character.getMiiValue(param1);
         if(_loc2_)
         {
            _loc3_ = ranges[param1] as Range;
            if(_loc3_)
            {
               return _loc3_.valueAt(_loc2_.getValuePercent());
            }
         }
         return 0;
      }
      
      public function drawCharacter() : void
      {
         var _loc1_:* = undefined;
         var _loc2_:int = 0;
         var _loc3_:int = 0;
         var _loc4_:ColorTransform = null;
         var _loc5_:Number = NaN;
         var _loc6_:Number = NaN;
         var _loc7_:Number = NaN;
         var _loc8_:Number = NaN;
         var _loc9_:Number = NaN;
         var _loc10_:int = 0;
         var _loc11_:int = 0;
         var _loc12_:int = 0;
         if(!_character)
         {
            return;
         }
         _loc3_ = getFrame("headType");
         head.face.gotoAndStop(_loc3_);
         head.beard.gotoAndStop(_character.getValue("beardType") * HEAD_TYPE_COUNT + _loc3_);
         currHeadOffset = faceShapeOffsets[_loc3_ - 1];
         _loc2_ = getFrame("noseType");
         head.nose.gotoAndStop(_loc2_);
         head.nose.skin.gotoAndStop(_loc2_);
         _loc2_ = getFrame("mouthType");
         head.mouth.gotoAndStop(_loc2_);
         head.mouth.lips.gotoAndStop(_loc2_);
         head.mustache.gotoAndStop(getFrame("mustacheType"));
         head.mole.gotoAndStop(getFrame("moleType"));
         _loc1_ = _character.getValue("facialFeaturesType");
         head.features.gotoAndStop(_loc1_ * HEAD_TYPE_COUNT + _loc3_);
         head.features.blendMode = _loc1_ < 3 ? BlendMode.NORMAL : BlendMode.MULTIPLY;
         _loc2_ = getFrame("hairType");
         head.hats.gotoAndStop(_loc2_);
         head.hairFront.gotoAndStop(_loc2_);
         headback.hair.gotoAndStop(_loc2_);
         _loc2_ = getFrame("glassesType");
         head.glasses.gotoAndStop(_loc2_);
         head.glasses.lenses.gotoAndStop(_loc2_);
         _loc2_ = getFrame("eyeType");
         head.eyesRight.gotoAndStop(_loc2_);
         head.eyesRight.eyeball.gotoAndStop(_loc2_);
         head.eyesLeft.gotoAndStop(_loc2_);
         head.eyesLeft.eyeball.gotoAndStop(_loc2_);
         _loc2_ = getFrame("eyebrowType");
         head.eyebrowsRight.gotoAndStop(_loc2_);
         head.eyebrowsLeft.gotoAndStop(_loc2_);
         _loc4_ = getColor("skinColor");
         head.face.transform.colorTransform = _loc4_;
         head.nose.skin.transform.colorTransform = _loc4_;
         _loc4_ = getColor("glassesColor");
         head.glasses.lenses.transform.colorTransform = _loc4_;
         head.glasses.transform.colorTransform = head.glasses.currentFrame < SHADED_GLASSES_FRAME ? _loc4_ : new ColorTransform();
         _loc4_ = getColor("favoriteColor");
         head.hats.transform.colorTransform = _loc4_;
         _loc4_ = getColor("hairColor");
         head.hairFront.transform.colorTransform = _loc4_;
         headback.hair.transform.colorTransform = _loc4_;
         _loc4_ = getColor("eyebrowColor");
         head.eyebrowsRight.transform.colorTransform = _loc4_;
         head.eyebrowsLeft.transform.colorTransform = _loc4_;
         _loc4_ = getColor("eyeColor");
         head.eyesRight.eyeball.transform.colorTransform = _loc4_;
         head.eyesLeft.eyeball.transform.colorTransform = _loc4_;
         _loc4_ = getColor("facialHairColor");
         head.mustache.transform.colorTransform = _loc4_;
         head.beard.transform.colorTransform = _loc4_;
         _loc4_ = getColor("mouthColor");
         head.mouth.lips.transform.colorTransform = reduceColor(_loc4_,0.4);
         bodyController.updateColors();
         _loc6_ = getRangeValue("eyeX");
         head.eyesRight.x = origin.x + _loc6_;
         head.eyesLeft.x = origin.x - _loc6_;
         _loc7_ = origin.y + getRangeValue("eyeY");
         head.eyesRight.y = _loc7_;
         head.eyesLeft.y = _loc7_;
         _loc8_ = getRangeValue("eyebrowX");
         head.eyebrowsRight.x = origin.x + _loc8_;
         head.eyebrowsLeft.x = origin.x - _loc8_;
         _loc9_ = origin.y + getRangeValue("eyebrowY");
         head.eyebrowsRight.y = _loc9_;
         head.eyebrowsLeft.y = _loc9_;
         head.nose.y = origin.y + getRangeValue("noseY");
         head.mouth.y = origin.y + getRangeValue("mouthY");
         head.glasses.y = origin.y + getRangeValue("glassesY");
         head.mole.x = origin.x + getRangeValue("moleX");
         head.mole.y = origin.y + getRangeValue("moleY");
         head.mustache.y = origin.y + getRangeValue("mustacheY");
         _loc5_ = _character.getValue("hairPart");
         head.hairFront.scaleX = _loc5_ ? -1 : 1;
         headback.hair.scaleX = head.hairFront.scaleX;
         head.hats.scaleX = head.hairFront.scaleX;
         _loc5_ = getRangeValue("eyeSize");
         head.eyesRight.scaleX = _loc5_;
         head.eyesRight.scaleY = _loc5_;
         head.eyesLeft.scaleX = _loc5_;
         head.eyesLeft.scaleY = _loc5_;
         _loc5_ = getRangeValue("eyebrowSize");
         head.eyebrowsRight.scaleX = _loc5_;
         head.eyebrowsRight.scaleY = _loc5_;
         head.eyebrowsLeft.scaleX = _loc5_;
         head.eyebrowsLeft.scaleY = _loc5_;
         _loc5_ = getRangeValue("noseSize");
         head.nose.scaleX = _loc5_;
         head.nose.scaleY = _loc5_;
         _loc5_ = getRangeValue("mouthSize");
         head.mouth.scaleX = _loc5_;
         head.mouth.scaleY = _loc5_;
         _loc5_ = getRangeValue("glassesSize");
         head.glasses.scaleX = _loc5_;
         head.glasses.scaleY = _loc5_;
         _loc5_ = getRangeValue("moleSize");
         head.mole.scaleX = _loc5_;
         head.mole.scaleY = _loc5_;
         _loc5_ = getRangeValue("mustacheSize");
         head.mustache.scaleX = _loc5_;
         head.mustache.scaleY = _loc5_;
         _loc5_ = getRangeValue("eyeRotation");
         head.eyesRight.rotation = -_loc5_;
         head.eyesLeft.rotation = 180 + _loc5_;
         _loc5_ = getRangeValue("eyebrowRotation");
         head.eyebrowsRight.rotation = -_loc5_;
         head.eyebrowsLeft.rotation = 180 + _loc5_;
         _loc10_ = 10;
         _loc11_ = 37;
         _loc12_ = -67;
         head.setChildIndex(head.eyesLeft,_loc10_);
         head.setChildIndex(head.eyesRight,_loc10_);
         head.setChildIndex(head.eyebrowsLeft,_loc10_);
         head.setChildIndex(head.eyebrowsRight,_loc10_);
         head.setChildIndex(head.hairFront,_loc10_);
         head.setChildIndex(head.hats,_loc10_);
         if(_loc6_ > _loc11_ || _loc7_ < _loc12_)
         {
            head.setChildIndex(head.eyesLeft,_loc10_);
            head.setChildIndex(head.eyesRight,_loc10_);
         }
         if(_loc8_ > _loc11_ || _loc7_ < _loc12_)
         {
            head.setChildIndex(head.eyebrowsLeft,_loc10_);
            head.setChildIndex(head.eyebrowsRight,_loc10_);
         }
         drawCharacterBody();
      }
      
      public function set character(param1:MiiCharacterData) : void
      {
         _character = param1;
         drawCharacter();
      }
      
      public function frameToValue(param1:String, param2:int) : int
      {
         return MiiCharacterData.valueToFrameLookup[param1] ? int(MiiCharacterData.valueToFrameLookup[param1].indexOf(param2 - 1)) : int(param2 - 1);
      }
      
      public function get globalFooting() : Point
      {
         var _loc1_:Point = null;
         _loc1_ = new Point(body.shadow.x,body.shadow.y);
         return body.localToGlobal(_loc1_);
      }
      
      private function reduceColor(param1:ColorTransform, param2:Number) : ColorTransform
      {
         param2 = 1 - param2;
         return new ColorTransform(param1.redMultiplier - (param1.redMultiplier - 1) * param2,param1.greenMultiplier - (param1.greenMultiplier - 1) * param2,param1.blueMultiplier - (param1.blueMultiplier - 1) * param2,param1.alphaMultiplier - (param1.alphaMultiplier - 1) * param2,param1.redOffset * param2,param1.greenOffset * param2,param1.blueOffset * param2,param1.alphaOffset * param2);
      }
      
      public function drawCharacterBody() : void
      {
         head.y = baseHeadY - currHeadOffset;
         headback.y = head.y;
         bodyController.updateSize();
      }
      
      public function getColor(param1:String) : ColorTransform
      {
         var _loc2_:* = undefined;
         var _loc3_:Array = null;
         _loc2_ = _character.getValue(param1) as int;
         if(_loc2_ !== null)
         {
            switch(param1)
            {
               case "favoriteColor":
                  _loc3_ = favoriteColors;
                  break;
               case "skinColor":
                  _loc3_ = skinColors;
                  break;
               case "eyeColor":
                  _loc3_ = eyeColors;
                  break;
               case "hairColor":
               case "eyebrowColor":
               case "facialHairColor":
                  _loc3_ = hairColors;
                  break;
               case "mouthColor":
                  _loc3_ = mouthColors;
                  break;
               case "glassesColor":
                  _loc3_ = glassesColors;
            }
            if(Boolean(_loc3_) && _loc2_ < _loc3_.length)
            {
               return _loc3_[_loc2_];
            }
         }
         return new ColorTransform();
      }
      
      public function getFrame(param1:String) : int
      {
         var _loc2_:* = undefined;
         var _loc3_:Array = null;
         _loc2_ = _character.getValue(param1) as int;
         if(_loc2_ !== null)
         {
            _loc3_ = MiiCharacterData.valueToFrameLookup[param1];
            if(Boolean(_loc3_) && _loc2_ < _loc3_.length)
            {
               return int(_loc3_[_loc2_] + 1);
            }
            return int(_loc2_ + 1);
         }
         return 0;
      }
   }
}

