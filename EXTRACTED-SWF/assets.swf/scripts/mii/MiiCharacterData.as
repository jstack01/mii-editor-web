package mii
{
   import flash.utils.ByteArray;
   import mii.values.*;
   
   public class MiiCharacterData
   {
      
      public static const MII_BLOCK_SIZE:int = 16;
      
      public static const MII_BLOCK_COUNT:int = 37;
      
      public static const MII_STRING_LENGTH:int = 10;
      
      public static const MII_FILE_SIZE:int = 74;
      
      public static const BASIC:int = 0;
      
      public static const MII_NAME:int = 1;
      
      public static const SIZE:int = 11;
      
      public static const MII_ID:int = 12;
      
      public static const WII_MAC:int = 14;
      
      public static const FACE:int = 16;
      
      public static const HAIR:int = 17;
      
      public static const EYEBROWS1:int = 18;
      
      public static const EYEBROWS2:int = 19;
      
      public static const EYES1:int = 20;
      
      public static const EYES2:int = 21;
      
      public static const NOSE:int = 22;
      
      public static const LIPS:int = 23;
      
      public static const GLASSES:int = 24;
      
      public static const MUSTACHE:int = 25;
      
      public static const MOLE:int = 26;
      
      public static const CREATOR_NAME:int = 27;
      
      private static const HexStringReg:RegExp = /[0-9a-zA-Z]{1,2}/g;
      
      public static const valueToFrameLookup:Object = {
         "eyeType":[2,6,0,42,1,24,29,36,3,16,45,13,17,26,46,9,8,5,33,14,11,20,44,18,30,21,7,10,34,41,31,32,15,12,19,23,27,28,38,4,22,25,39,43,37,40,35,47],
         "eyebrowType":[1,3,14,15,11,10,0,6,8,4,13,12,2,19,16,18,22,9,21,5,17,7,20,23],
         "hairType":[59,42,65,49,40,44,52,47,45,63,51,54,36,37,48,70,61,56,64,43,53,58,50,27,69,41,39,46,66,71,33,11,12,0,35,57,30,14,25,4,1,31,26,24,3,6,62,13,15,7,19,2,17,67,29,20,9,34,18,8,22,60,23,55,21,32,16,28,10,38,5,68],
         "noseType":[5,0,2,3,7,6,4,10,8,9,1,11],
         "mouthType":[6,1,14,16,17,5,10,12,7,13,8,19,23,11,22,18,9,15,21,2,20,3,4,0]
      };
      
      public static const valueNames:Array = ["beardType","birthDate","birthMonth","eyeColor","eyeRotation","eyeSize","eyeType","eyeX","eyeY","eyebrowColor","eyebrowRotation","eyebrowSize","eyebrowType","eyebrowX","eyebrowY","facialFeaturesType","facialHairColor","favoriteColor","gender","glassesColor","glassesSize","glassesType","glassesY","hairColor","hairPart","hairType","headType","height","mingles","moleSize","moleType","moleX","moleY","mouthColor","mouthSize","mouthType","mouthY","mustacheSize","mustacheType","mustacheY","noseSize","noseType","noseY","skinColor","weight"];
      
      public var blocks:Array = new Array(MII_BLOCK_COUNT);
      
      private var values:Array = new Array();
      
      private var data:ByteArray = new ByteArray();
      
      public function MiiCharacterData(param1:* = null)
      {
         super();
         if(param1)
         {
            setData(param1);
         }
         else
         {
            defaultBlocks();
            defineValues();
         }
      }
      
      public function toXMLString() : String
      {
         var _loc1_:String = null;
         _loc1_ = "<?xml version=\"1.0\" ?>\n";
         _loc1_ += "<?xml-stylesheet type=\"text/xsl\" href=\"http://www.miieditor.com/xml/mii.xsl\" ?>\n";
         _loc1_ += "<!DOCTYPE mii-collection SYSTEM \"http://www.miieditor.com/xml/mii.dtd\" >\n";
         return _loc1_ + getXMLData().toXMLString();
      }
      
      public function getString(param1:String) : String
      {
         var _loc2_:Array = null;
         var _loc3_:String = null;
         var _loc4_:MiiDataValue = null;
         var _loc5_:int = 0;
         var _loc6_:String = null;
         var _loc7_:int = 0;
         var _loc8_:int = 0;
         _loc2_ = values[param1] as Array;
         if(_loc2_)
         {
            _loc3_ = "";
            _loc7_ = int(_loc2_.length);
            _loc8_ = 0;
            while(_loc8_ < _loc7_)
            {
               _loc4_ = _loc2_[_loc8_] as MiiDataValue;
               if((Boolean(_loc4_)) && (Boolean(_loc5_ = _loc4_.value)))
               {
                  _loc6_ = String.fromCharCode(_loc5_);
                  if(_loc6_)
                  {
                     _loc3_ += _loc6_;
                  }
               }
               _loc8_++;
            }
            return _loc3_;
         }
         return "";
      }
      
      public function setString(param1:String, param2:String) : Boolean
      {
         var _loc3_:Array = null;
         var _loc4_:MiiDataValue = null;
         var _loc5_:int = 0;
         var _loc6_:int = 0;
         _loc3_ = values[param1] as Array;
         if(_loc3_)
         {
            _loc5_ = param2.length;
            _loc6_ = 0;
            while(_loc6_ < MII_STRING_LENGTH)
            {
               _loc4_ = _loc3_[_loc6_] as MiiDataValue;
               if(_loc4_)
               {
                  _loc4_.value = _loc6_ < _loc5_ ? int(param2.charCodeAt(_loc6_)) : 0;
               }
               _loc6_++;
            }
            return true;
         }
         return false;
      }
      
      public function setHex(param1:String, param2:String) : Boolean
      {
         var _loc3_:Array = null;
         var _loc4_:Array = null;
         var _loc5_:MiiDataValue = null;
         var _loc6_:* = 0;
         _loc3_ = getMiiValue(param1) as Array;
         if(_loc3_)
         {
            _loc4_ = param2.match(HexStringReg);
            if(_loc4_.length >= _loc3_.length)
            {
               _loc6_ = int(_loc3_.length);
               while(_loc6_--)
               {
                  _loc5_ = _loc3_[_loc6_] as MiiDataValue;
                  if(_loc5_)
                  {
                     _loc5_.value = parseInt(_loc4_[_loc6_],16);
                  }
               }
               return true;
            }
         }
         return false;
      }
      
      public function getMiiValue(param1:String) : *
      {
         var _loc2_:MiiDataValue = null;
         var _loc3_:Array = null;
         _loc2_ = values[param1] as MiiDataValue;
         if(_loc2_)
         {
            return _loc2_;
         }
         _loc3_ = values[param1] as Array;
         if(_loc3_)
         {
            return _loc3_;
         }
         return null;
      }
      
      public function setXMLData(param1:*) : void
      {
         var xml:* = param1;
         if(xml is XML)
         {
            parseXMLData(XML(xml));
         }
         else
         {
            try
            {
               parseXMLData(new XML(xml));
            }
            catch(err:Error)
            {
            }
         }
      }
      
      public function getData() : ByteArray
      {
         var _loc1_:ByteArray = null;
         var _loc2_:int = 0;
         var _loc3_:int = 0;
         _loc1_ = new ByteArray();
         _loc3_ = int(blocks.length);
         _loc2_ = 0;
         while(_loc2_ < _loc3_)
         {
            _loc1_.writeShort(int(blocks[_loc2_]));
            _loc2_++;
         }
         return _loc1_;
      }
      
      public function setHexData(param1:String) : void
      {
         var _loc2_:ByteArray = null;
         var _loc3_:Array = null;
         var _loc4_:int = 0;
         var _loc5_:String = null;
         var _loc6_:int = 0;
         var _loc7_:int = 0;
         var _loc8_:int = 0;
         if(!param1)
         {
            return;
         }
         _loc2_ = new ByteArray();
         _loc3_ = param1.match(HexStringReg);
         _loc4_ = int(_loc3_.length);
         _loc5_ = "";
         _loc7_ = MII_FILE_SIZE;
         _loc8_ = 0;
         while(_loc8_ < _loc7_)
         {
            _loc6_ = _loc8_ < _loc4_ ? int(parseInt(_loc3_[_loc8_],16)) : 0;
            _loc2_.writeByte(int(_loc6_));
            _loc8_++;
         }
         parseByteData(_loc2_);
      }
      
      public function parseByteData(param1:ByteArray) : Boolean
      {
         var i:int = 0;
         var byteData:ByteArray = param1;
         try
         {
            if(byteData.length != MII_FILE_SIZE)
            {
               throw new Error();
            }
         }
         catch(e:Error)
         {
            data = new ByteArray();
            return false;
         }
         byteData.position = 0;
         defaultBlocks();
         i = 0;
         while(byteData.position < MII_FILE_SIZE)
         {
            blocks[i] = byteData.readUnsignedShort();
            i++;
         }
         defineValues();
         data = byteData;
         return true;
      }
      
      public function defaultBlocks() : void
      {
         var _loc1_:* = 0;
         _loc1_ = MII_BLOCK_COUNT;
         blocks.length = _loc1_;
         while(_loc1_--)
         {
            blocks[_loc1_] = 0;
         }
      }
      
      public function getXMLData() : XML
      {
         var _loc1_:XML = null;
         var _loc2_:String = null;
         var _loc3_:MiiDataValue = null;
         var _loc4_:Array = null;
         var _loc5_:* = undefined;
         var _loc6_:* = undefined;
         var _loc7_:* = undefined;
         var _loc8_:int = 0;
         var _loc9_:int = 0;
         _loc1_ = <mii-collection><mii value={getHexData()}/></mii-collection>;
         _loc1_.mii[0].appendChild(<name maxChars="10">{getString("name")}</name>);
         _loc1_.mii[0].appendChild(<creator maxChars="10">{getString("creator")}</creator>);
         _loc1_.mii[0].appendChild(<data name="id" value={getHex("id")} format="hexadecimal" min={getHex("id","00")} max={getHex("id","FF")}/>);
         _loc1_.mii[0].appendChild(<data name="wii" value={getHex("wii")} format="hexadecimal" min={getHex("wii","00")} max={getHex("wii","FF")}/>);
         _loc9_ = int(valueNames.length);
         _loc8_ = 0;
         while(_loc8_ < _loc9_)
         {
            _loc2_ = valueNames[_loc8_];
            _loc3_ = getMiiValue(_loc2_);
            _loc5_ = _loc3_.value;
            _loc6_ = _loc3_.min;
            _loc7_ = _loc3_.max;
            switch(_loc2_)
            {
               case "eyeY":
               case "glassesY":
               case "moleY":
               case "mouthY":
               case "mustacheY":
               case "noseY":
                  _loc5_ = _loc7_ - _loc5_;
                  break;
               case "eyebrowY":
                  _loc5_ -= 3;
                  _loc6_ -= 3;
                  _loc7_ -= 3;
                  _loc5_ = _loc7_ - _loc5_;
                  break;
               case "mingles":
                  _loc5_ = _loc5_ == 0 ? 1 : 0;
            }
            _loc4_ = valueToFrameLookup[_loc2_];
            if((Boolean(_loc4_)) && _loc5_ < _loc4_.length)
            {
               _loc5_ = int(_loc4_[_loc5_]);
            }
            _loc1_.mii[0].appendChild(<data name={_loc2_} value={_loc5_} format="integer" min={_loc6_} max={_loc7_}/>);
            _loc8_++;
         }
         return _loc1_;
      }
      
      public function setData(param1:*) : void
      {
         var data:* = param1;
         try
         {
            if(data is ByteArray)
            {
               parseByteData(ByteArray(data));
            }
            else if(data is XML)
            {
               parseXMLData(XML(data));
            }
            else if(data is String)
            {
               if(isNaN(parseInt(data,16)))
               {
                  parseXMLData(XML(data));
               }
               else
               {
                  setHexData(String(data));
               }
            }
         }
         catch(e:Error)
         {
         }
      }
      
      public function parseXMLData(param1:XML) : Boolean
      {
         var name:String = null;
         var map:Array = null;
         var pos:int = 0;
         var value:* = undefined;
         var element:XML = null;
         var miiValue:MiiDataValue = null;
         var miiXML:XML = param1;
         if(miiXML.name().localName != "mii")
         {
            try
            {
               miiXML = miiXML.mii[0];
            }
            catch(e:Error)
            {
               return false;
            }
         }
         defaultBlocks();
         defineValues();
         if(Boolean(miiXML.name))
         {
            setValue("name",String(miiXML.name[0].valueOf()));
         }
         if(miiXML.creator)
         {
            setValue("creator",String(miiXML.creator[0].valueOf()));
         }
         for each(element in miiXML.data)
         {
            name = element.@name;
            if(values[name] != undefined)
            {
               value = element.@value;
               switch(name)
               {
                  case "eyeY":
                  case "glassesY":
                  case "moleY":
                  case "mouthY":
                  case "mustacheY":
                  case "noseY":
                     miiValue = getMiiValue(name);
                     value = miiValue.max - int(value);
                     break;
                  case "eyebrowY":
                     miiValue = getMiiValue(name);
                     value = miiValue.max - 3 - int(value);
                     value += 3;
                     break;
                  case "mingles":
                     value = int(value) == 0 ? 1 : 0;
               }
               map = valueToFrameLookup[name];
               if(map)
               {
                  pos = map.indexOf(int(value));
                  if(pos != -1)
                  {
                     value = pos;
                  }
               }
               setValue(name,value);
            }
         }
         data = getData();
         return true;
      }
      
      public function setValue(param1:String, param2:*) : Boolean
      {
         var _loc3_:MiiDataValue = null;
         switch(param1)
         {
            case "name":
            case "creator":
               return setString(param1,String(param2));
            case "wii":
            case "id":
               return setHex(param1,String(param2));
            default:
               _loc3_ = values[param1] as MiiDataValue;
               if(_loc3_)
               {
                  _loc3_.value = int(param2);
                  return true;
               }
               return false;
         }
      }
      
      public function randomize() : void
      {
         var _loc1_:MiiDataValue = null;
         var _loc2_:String = null;
         var _loc3_:Array = null;
         for each(_loc2_ in valueNames)
         {
            _loc1_ = values[_loc2_] as MiiDataValue;
            if(_loc1_)
            {
               _loc1_.randomize();
            }
         }
         _loc3_ = values["id"] as Array;
         if(_loc3_)
         {
            for each(_loc1_ in _loc3_)
            {
               _loc1_.randomize();
            }
         }
         setString("name","Random");
         setString("creator","Mii Editor");
      }
      
      public function toString() : String
      {
         return "[object MiiCharacterData]";
      }
      
      public function getHex(param1:String, param2:String = "") : String
      {
         var _loc3_:Array = null;
         var _loc4_:String = null;
         var _loc5_:int = 0;
         var _loc6_:int = 0;
         var _loc7_:int = 0;
         _loc3_ = getValue(param1) as Array;
         if(_loc3_)
         {
            _loc4_ = "";
            _loc6_ = int(_loc3_.length);
            _loc7_ = 0;
            while(_loc7_ < _loc6_)
            {
               if(_loc4_)
               {
                  _loc4_ += "-";
               }
               if(param2)
               {
                  _loc4_ += param2;
               }
               else
               {
                  _loc5_ = int(_loc3_[_loc7_]);
                  _loc4_ += _loc5_ < 10 ? "0" + _loc5_.toString(16) : _loc5_.toString(16);
               }
               _loc7_++;
            }
            return _loc4_;
         }
         return "";
      }
      
      private function defineValue(param1:String, param2:int, param3:int, param4:int = 1, param5:int = 0, param6:int = 0) : void
      {
         values[param1] = new MiiDataValue(blocks,param2,param3,param4,param5,param6);
      }
      
      public function getValue(param1:String) : *
      {
         var _loc2_:MiiDataValue = null;
         var _loc3_:Array = null;
         var _loc4_:Array = null;
         var _loc5_:* = 0;
         switch(param1)
         {
            case "name":
            case "creator":
               return getString(param1);
            default:
               _loc2_ = values[param1] as MiiDataValue;
               if(_loc2_)
               {
                  return _loc2_.value;
               }
               _loc3_ = values[param1] as Array;
               if(_loc3_)
               {
                  _loc4_ = new Array();
                  _loc5_ = int(_loc3_.length);
                  while(_loc5_--)
                  {
                     _loc4_[_loc5_] = _loc3_[_loc5_].value;
                  }
                  return _loc4_;
               }
               return null;
         }
      }
      
      private function defineComplexValue(param1:String, param2:int, param3:int, param4:int = 1, param5:int = 1) : void
      {
         var _loc6_:Array = null;
         var _loc7_:int = 0;
         _loc6_ = new Array();
         _loc7_ = 0;
         while(_loc7_ < param5)
         {
            _loc6_[_loc7_] = new MiiDataValue(blocks,param2,param3,param4);
            param3 -= param4;
            if(param3 < 0)
            {
               param2++;
               param3 += MII_BLOCK_SIZE;
            }
            _loc7_++;
         }
         values[param1] = _loc6_;
      }
      
      public function defineValues() : void
      {
         defineValue("gender",BASIC,14);
         defineValue("favoriteColor",BASIC,1,4,0,11);
         defineValue("birthDate",BASIC,5,5,0,31);
         defineValue("birthMonth",BASIC,10,4,0,12);
         defineValue("height",SIZE,8,7);
         defineValue("weight",SIZE,0,7);
         defineValue("headType",FACE,13,3,0,7);
         defineValue("skinColor",FACE,10,3,0,5);
         defineValue("facialFeaturesType",FACE,6,4,0,11);
         defineValue("mingles",FACE,2);
         defineValue("hairType",HAIR,9,7,0,71);
         defineValue("hairColor",HAIR,6,3,0,7);
         defineValue("hairPart",HAIR,5);
         defineValue("eyebrowType",EYEBROWS1,11,5,0,23);
         defineValue("eyebrowRotation",EYEBROWS1,6,4,0,11);
         defineValue("eyebrowColor",EYEBROWS2,13,3);
         defineValue("eyebrowSize",EYEBROWS2,9,4,0,8);
         defineValue("eyebrowY",EYEBROWS2,4,5,3,18);
         defineValue("eyebrowX",EYEBROWS2,0,4,0,12);
         defineValue("eyeType",EYES1,10,6,0,47);
         defineValue("eyeRotation",EYES1,5,3);
         defineValue("eyeY",EYES1,0,5,0,18);
         defineValue("eyeColor",EYES2,13,3,0,5);
         defineValue("eyeSize",EYES2,9,3,0,7);
         defineValue("eyeX",EYES2,5,4,0,12);
         defineValue("noseType",NOSE,12,4,0,11);
         defineValue("noseSize",NOSE,8,4,0,8);
         defineValue("noseY",NOSE,3,5,0,18);
         defineValue("mouthType",LIPS,11,5,0,23);
         defineValue("mouthColor",LIPS,9,2,0,2);
         defineValue("mouthSize",LIPS,5,4,0,8);
         defineValue("mouthY",LIPS,0,5,0,18);
         defineValue("glassesType",GLASSES,12,4,0,8);
         defineValue("glassesColor",GLASSES,9,3,0,5);
         defineValue("glassesSize",GLASSES,5,3,0,7);
         defineValue("glassesY",GLASSES,0,5,0,20);
         defineValue("mustacheType",MUSTACHE,14,2);
         defineValue("beardType",MUSTACHE,12,2);
         defineValue("facialHairColor",MUSTACHE,9,3);
         defineValue("mustacheSize",MUSTACHE,5,4,0,8);
         defineValue("mustacheY",MUSTACHE,0,5,0,16);
         defineValue("moleType",MOLE,15);
         defineValue("moleSize",MOLE,11,4);
         defineValue("moleY",MOLE,6,5,0,30);
         defineValue("moleX",MOLE,1,5,0,16);
         defineComplexValue("id",MII_ID,8,8,4);
         defineComplexValue("wii",WII_MAC,8,8,4);
         defineComplexValue("name",MII_NAME,0,MII_BLOCK_SIZE,MII_STRING_LENGTH);
         defineComplexValue("creator",CREATOR_NAME,0,MII_BLOCK_SIZE,MII_STRING_LENGTH);
      }
      
      public function getHexData() : String
      {
         var _loc1_:ByteArray = null;
         var _loc2_:String = null;
         var _loc3_:String = null;
         var _loc4_:int = 0;
         var _loc5_:int = 0;
         _loc1_ = getData();
         _loc2_ = "";
         _loc3_ = "";
         _loc4_ = MII_FILE_SIZE;
         _loc5_ = 0;
         while(_loc5_ < _loc4_)
         {
            _loc3_ = Number(_loc1_[_loc5_]).toString(16);
            while(_loc3_.length < 2)
            {
               _loc3_ = "0" + _loc3_;
            }
            _loc2_ += _loc3_;
            _loc5_++;
         }
         return _loc2_;
      }
   }
}

