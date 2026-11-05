package mii.authoring
{
   public class CharacteristicsEye extends AbstractGUIPage
   {
      
      public function CharacteristicsEye(param1:ClassicGUI)
      {
         super(param1);
         pageCount = 4;
         itemCount = 12;
         currPage = 0;
         currProp = "eye";
      }
      
      override public function updateGUI() : void
      {
         super.updateGUI();
         target.assignItemListeners();
         target.assignPageListeners();
         target.setupColors("eye");
         target.assignOptionListeners(["X","Y","Size","Rotation"]);
         target.drawPage();
         target.updateURLText();
      }
   }
}

