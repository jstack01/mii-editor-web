package com.senocular.ui
{
   import flash.display.DisplayObject;
   import flash.display.DisplayObjectContainer;
   import flash.display.InteractiveObject;
   import flash.display.SimpleButton;
   import flash.display.Stage;
   import flash.events.Event;
   import flash.events.EventDispatcher;
   import flash.events.KeyboardEvent;
   import flash.events.MouseEvent;
   import flash.geom.Point;
   import flash.utils.Dictionary;
   
   public class VirtualMouse extends EventDispatcher
   {
      
      private static var _instance:VirtualMouse;
      
      public static const UPDATE:String = "update";
      
      private var _enabled:Boolean = true;
      
      private var lastDownTarget:DisplayObject;
      
      private var shiftKey:Boolean = false;
      
      private var target:InteractiveObject;
      
      private var eventEvent:Class = VirtualMouseEvent;
      
      private var _lastEvent:Event;
      
      private var mouseEventEvent:Class = VirtualMouseMouseEvent;
      
      private var _mouseIsDown:Boolean = false;
      
      private var location:Point;
      
      private var delta:int = 0;
      
      private var disabledEvents:Object = new Object();
      
      private var ignoredInstances:Dictionary = new Dictionary(true);
      
      private var isLocked:Boolean = false;
      
      private var lastWithinStage:Boolean = true;
      
      private var lastLocation:Point;
      
      private var isDoubleClickEvent:Boolean = false;
      
      private var lastMouseDown:Boolean = false;
      
      private var altKey:Boolean = false;
      
      private var _useNativeEvents:Boolean = false;
      
      private var ctrlKey:Boolean = false;
      
      private var _updatesEveryFrame:Boolean = false;
      
      private var _stage:Stage;
      
      public function VirtualMouse(param1:Stage = null, param2:Number = 0, param3:Number = 0)
      {
         super();
         this.stage = param1;
         location = new Point(param2,param3);
         lastLocation = location.clone();
         addEventListener(UPDATE,handleUpdate);
         internalUpdate();
      }
      
      public static function getInstance() : VirtualMouse
      {
         if(!_instance)
         {
            _instance = new VirtualMouse();
         }
         return _instance;
      }
      
      public function get mouseIsDown() : Boolean
      {
         return _mouseIsDown;
      }
      
      public function get stage() : Stage
      {
         return _stage;
      }
      
      public function set x(param1:Number) : void
      {
         location.x = param1;
         internalUpdate();
      }
      
      public function get updatesEveryFrame() : Boolean
      {
         return _updatesEveryFrame;
      }
      
      public function release() : void
      {
         if(!_mouseIsDown)
         {
            return;
         }
         _mouseIsDown = false;
         internalUpdate();
      }
      
      public function click() : void
      {
         press();
         release();
      }
      
      public function disableEvent(param1:String) : void
      {
         disabledEvents[param1] = true;
      }
      
      public function set enabled(param1:Boolean) : void
      {
         _enabled = param1;
      }
      
      public function get y() : Number
      {
         return location.y;
      }
      
      public function get lastEvent() : Event
      {
         return _lastEvent;
      }
      
      private function handleUpdate(param1:Event) : void
      {
         var _loc2_:Array = null;
         var _loc3_:InteractiveObject = null;
         var _loc4_:DisplayObject = null;
         var _loc5_:* = 0;
         var _loc6_:Point = null;
         var _loc7_:Point = null;
         var _loc8_:Boolean = false;
         if(!_stage || !_enabled)
         {
            return;
         }
         _loc2_ = _stage.getObjectsUnderPoint(location);
         _loc5_ = int(_loc2_.length);
         while(_loc5_--)
         {
            _loc4_ = _loc2_[_loc5_];
            while(_loc4_)
            {
               if(ignoredInstances[_loc4_])
               {
                  _loc3_ = null;
                  break;
               }
               if(Boolean(_loc3_) && _loc4_ is SimpleButton)
               {
                  _loc3_ = null;
               }
               else if(Boolean(_loc3_) && !DisplayObjectContainer(_loc4_).mouseChildren)
               {
                  _loc3_ = null;
               }
               if(!_loc3_ && _loc4_ is InteractiveObject && InteractiveObject(_loc4_).mouseEnabled)
               {
                  _loc3_ = InteractiveObject(_loc4_);
               }
               _loc4_ = _loc4_.parent;
            }
            if(_loc3_)
            {
               break;
            }
         }
         if(!_loc3_)
         {
            _loc3_ = _stage;
         }
         _loc6_ = target.globalToLocal(location);
         _loc7_ = _loc3_.globalToLocal(location);
         if(lastLocation.x != location.x || lastLocation.y != location.y)
         {
            _loc8_ = Boolean(location.x >= 0 && location.y >= 0 && location.x <= stage.stageWidth && location.y <= stage.stageHeight);
            if(!_loc8_ && lastWithinStage && !disabledEvents[Event.MOUSE_LEAVE])
            {
               _lastEvent = new eventEvent(Event.MOUSE_LEAVE,false,false);
               stage.dispatchEvent(_lastEvent);
               dispatchEvent(_lastEvent);
            }
            if(_loc8_ && !disabledEvents[MouseEvent.MOUSE_MOVE])
            {
               _lastEvent = new mouseEventEvent(MouseEvent.MOUSE_MOVE,true,false,_loc7_.x,_loc7_.y,_loc3_,ctrlKey,altKey,shiftKey,_mouseIsDown,delta);
               _loc3_.dispatchEvent(_lastEvent);
               dispatchEvent(_lastEvent);
            }
            lastWithinStage = _loc8_;
         }
         if(_loc3_ != target)
         {
            if(!disabledEvents[MouseEvent.MOUSE_OUT])
            {
               _lastEvent = new mouseEventEvent(MouseEvent.MOUSE_OUT,true,false,_loc6_.x,_loc6_.y,_loc3_,ctrlKey,altKey,shiftKey,_mouseIsDown,delta);
               target.dispatchEvent(_lastEvent);
               dispatchEvent(_lastEvent);
            }
            if(!disabledEvents[MouseEvent.ROLL_OUT])
            {
               _lastEvent = new mouseEventEvent(MouseEvent.ROLL_OUT,false,false,_loc6_.x,_loc6_.y,_loc3_,ctrlKey,altKey,shiftKey,_mouseIsDown,delta);
               target.dispatchEvent(_lastEvent);
               dispatchEvent(_lastEvent);
            }
            if(!disabledEvents[MouseEvent.MOUSE_OVER])
            {
               _lastEvent = new mouseEventEvent(MouseEvent.MOUSE_OVER,true,false,_loc7_.x,_loc7_.y,target,ctrlKey,altKey,shiftKey,_mouseIsDown,delta);
               _loc3_.dispatchEvent(_lastEvent);
               dispatchEvent(_lastEvent);
            }
            if(!disabledEvents[MouseEvent.ROLL_OVER])
            {
               _lastEvent = new mouseEventEvent(MouseEvent.ROLL_OVER,false,false,_loc7_.x,_loc7_.y,target,ctrlKey,altKey,shiftKey,_mouseIsDown,delta);
               _loc3_.dispatchEvent(_lastEvent);
               dispatchEvent(_lastEvent);
            }
         }
         if(lastMouseDown != _mouseIsDown)
         {
            if(_mouseIsDown)
            {
               if(!disabledEvents[MouseEvent.MOUSE_DOWN])
               {
                  _lastEvent = new mouseEventEvent(MouseEvent.MOUSE_DOWN,true,false,_loc7_.x,_loc7_.y,_loc3_,ctrlKey,altKey,shiftKey,_mouseIsDown,delta);
                  _loc3_.dispatchEvent(_lastEvent);
                  dispatchEvent(_lastEvent);
               }
               lastDownTarget = _loc3_;
            }
            else
            {
               if(!disabledEvents[MouseEvent.MOUSE_UP])
               {
                  _lastEvent = new mouseEventEvent(MouseEvent.MOUSE_UP,true,false,_loc7_.x,_loc7_.y,_loc3_,ctrlKey,altKey,shiftKey,_mouseIsDown,delta);
                  _loc3_.dispatchEvent(_lastEvent);
                  dispatchEvent(_lastEvent);
               }
               if(!disabledEvents[MouseEvent.CLICK] && _loc3_ == lastDownTarget)
               {
                  _lastEvent = new mouseEventEvent(MouseEvent.CLICK,true,false,_loc7_.x,_loc7_.y,_loc3_,ctrlKey,altKey,shiftKey,_mouseIsDown,delta);
                  _loc3_.dispatchEvent(_lastEvent);
                  dispatchEvent(_lastEvent);
               }
               lastDownTarget = null;
            }
         }
         if(isDoubleClickEvent && !disabledEvents[MouseEvent.DOUBLE_CLICK] && _loc3_.doubleClickEnabled)
         {
            _lastEvent = new mouseEventEvent(MouseEvent.DOUBLE_CLICK,true,false,_loc7_.x,_loc7_.y,_loc3_,ctrlKey,altKey,shiftKey,_mouseIsDown,delta);
            _loc3_.dispatchEvent(_lastEvent);
            dispatchEvent(_lastEvent);
         }
         lastLocation = location.clone();
         lastMouseDown = _mouseIsDown;
         target = _loc3_;
      }
      
      public function doubleClick() : void
      {
         if(isLocked)
         {
            release();
         }
         else
         {
            click();
            press();
            isDoubleClickEvent = true;
            release();
            isDoubleClickEvent = false;
         }
      }
      
      public function getLocation(param1:DisplayObject = null) : Point
      {
         if(param1)
         {
            return param1.globalToLocal(location);
         }
         return location.clone();
      }
      
      public function set updatesEveryFrame(param1:Boolean) : void
      {
         if(_updatesEveryFrame == param1)
         {
            return;
         }
         _updatesEveryFrame = param1;
         if(_stage)
         {
            if(_updatesEveryFrame)
            {
               _stage.addEventListener(Event.ENTER_FRAME,frameUpdateHandler);
            }
            else
            {
               _stage.removeEventListener(Event.ENTER_FRAME,frameUpdateHandler);
            }
         }
      }
      
      public function get useNativeEvents() : Boolean
      {
         return _useNativeEvents;
      }
      
      public function get x() : Number
      {
         return location.x;
      }
      
      private function keyHandler(param1:KeyboardEvent) : void
      {
         altKey = param1.altKey;
         ctrlKey = param1.ctrlKey;
         shiftKey = param1.shiftKey;
      }
      
      public function get enabled() : Boolean
      {
         return _enabled;
      }
      
      public function lock() : void
      {
         isLocked = true;
      }
      
      public function unlock() : void
      {
         isLocked = false;
         internalUpdate();
      }
      
      public function setLocation(param1:*, param2:* = null) : void
      {
         var _loc3_:Point = null;
         if(param1 is Point)
         {
            _loc3_ = Point(param1);
            location.x = _loc3_.x;
            location.y = _loc3_.y;
         }
         else
         {
            location.x = Number(param1);
            location.y = Number(param2);
         }
         internalUpdate();
      }
      
      public function update() : void
      {
         if(!_stage || !_enabled)
         {
            return;
         }
         handleUpdate(null);
      }
      
      public function localY(param1:DisplayObject = null) : Number
      {
         if(enabled)
         {
            return param1 ? param1.globalToLocal(location).y : location.y;
         }
         if(param1)
         {
            return param1.mouseY;
         }
         if(_stage)
         {
            return _stage.mouseY;
         }
         return NaN;
      }
      
      public function ignore(param1:DisplayObject) : void
      {
         ignoredInstances[param1] = true;
      }
      
      public function enableEvent(param1:String) : void
      {
         if(param1 in disabledEvents)
         {
            delete disabledEvents[param1];
         }
      }
      
      public function unignore(param1:DisplayObject) : void
      {
         if(param1 in ignoredInstances)
         {
            delete ignoredInstances[param1];
         }
      }
      
      public function localX(param1:DisplayObject = null) : Number
      {
         if(enabled)
         {
            return param1 ? param1.globalToLocal(location).x : location.x;
         }
         if(param1)
         {
            return param1.mouseX;
         }
         if(_stage)
         {
            return _stage.mouseX;
         }
         return NaN;
      }
      
      private function frameUpdateHandler(param1:Event) : void
      {
         dispatchEvent(new Event(UPDATE,false,false));
      }
      
      public function press() : void
      {
         if(_mouseIsDown)
         {
            return;
         }
         _mouseIsDown = true;
         internalUpdate();
      }
      
      private function internalUpdate() : void
      {
         if(!_stage || !_enabled)
         {
            return;
         }
         if(isLocked || _updatesEveryFrame)
         {
            return;
         }
         dispatchEvent(new Event(UPDATE,false,false));
      }
      
      public function set useNativeEvents(param1:Boolean) : void
      {
         if(param1 == _useNativeEvents)
         {
            return;
         }
         _useNativeEvents = param1;
         if(_useNativeEvents)
         {
            eventEvent = VirtualMouseEvent;
            mouseEventEvent = VirtualMouseMouseEvent;
         }
         else
         {
            eventEvent = Event;
            mouseEventEvent = MouseEvent;
         }
      }
      
      public function set y(param1:Number) : void
      {
         location.y = param1;
         internalUpdate();
      }
      
      public function set stage(param1:Stage) : void
      {
         var _loc2_:Boolean = false;
         if(_stage == param1)
         {
            return;
         }
         if(_stage)
         {
            _loc2_ = true;
            _stage.removeEventListener(KeyboardEvent.KEY_DOWN,keyHandler);
            _stage.removeEventListener(KeyboardEvent.KEY_UP,keyHandler);
            if(_updatesEveryFrame)
            {
               _stage.removeEventListener(Event.ENTER_FRAME,frameUpdateHandler);
            }
         }
         else
         {
            _loc2_ = false;
         }
         _stage = param1;
         if(_stage)
         {
            _stage.addEventListener(KeyboardEvent.KEY_DOWN,keyHandler);
            _stage.addEventListener(KeyboardEvent.KEY_UP,keyHandler);
            target = _stage;
            if(_updatesEveryFrame)
            {
               _stage.addEventListener(Event.ENTER_FRAME,frameUpdateHandler);
            }
            if(!_loc2_)
            {
               internalUpdate();
            }
         }
      }
   }
}

