package mii.authoring
{
   public class CharacteristicsEyebrow extends AbstractGUIPage
   {
      
      public function CharacteristicsEyebrow(param1:ClassicGUI)
      {
         super(param1);
         pageCount = 2;
         itemCount = 12;
         currPage = 0;
         currProp = "eyebrow";
      }
      
      override public function updateGUI() : void
      {
         super.updateGUI();
         target.assignItemListeners();
         target.assignPageListeners();
         target.setupColors("eyebrow");
         target.assignOptionListeners(["X","Y","Size","Rotation"]);
         target.drawPage();
         target.updateURLText();
      }
   }
}

